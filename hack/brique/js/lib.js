// Pure helpers for the Brick Face sketch.
// Loaded both as a plain <script> in the browser (attaches to window.BriqueLib)
// and via require() in Node tests (module.exports).

(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.BriqueLib = api;
    }
})(typeof self !== 'undefined' ? self : this, function () {

    const SILHOUETTE_INDICES = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
        397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
        172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
    ];

    const LEFT_EYE_ORDERED  = [33, 160, 159, 158, 133, 153, 145, 144];
    const RIGHT_EYE_ORDERED = [263, 387, 386, 385, 362, 380, 374, 373];
    const MOUTH_INDICES = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

    function clamp(v, lo, hi) {
        if (v < lo) return lo;
        if (v > hi) return hi;
        return v;
    }

    // Mirror X for front-facing camera, then scale normalized (0..1) point to screen.
    function mirrorAndScale(pt, scaleX, scaleY, offsetX, offsetY) {
        return {
            x: (1 - pt.x) * scaleX + offsetX,
            y: pt.y * scaleY + offsetY
        };
    }

    // Compute aspect-preserving "cover" fit of video into screen.
    // Returns {drawWidth, drawHeight, offsetX, offsetY}.
    function computeFit(screenW, screenH, videoW, videoH) {
        if (videoW <= 0 || videoH <= 0) {
            return { drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 };
        }
        const videoAspect = videoW / videoH;
        const screenAspect = screenW / screenH;
        let drawWidth, drawHeight, offsetX, offsetY;
        if (screenAspect > videoAspect) {
            drawWidth = screenW;
            drawHeight = screenW / videoAspect;
            offsetX = 0;
            offsetY = (screenH - drawHeight) / 2;
        } else {
            drawHeight = screenH;
            drawWidth = screenH * videoAspect;
            offsetX = (screenW - drawWidth) / 2;
            offsetY = 0;
        }
        return { drawWidth, drawHeight, offsetX, offsetY };
    }

    // Compute axis-aligned bbox of normalized keypoints. Returns null if none valid.
    function bboxFromKeypoints(keypoints) {
        if (!keypoints || keypoints.length === 0) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < keypoints.length; i++) {
            const pt = keypoints[i];
            if (!pt) continue;
            if (pt.x < minX) minX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y > maxY) maxY = pt.y;
        }
        if (!isFinite(minX) || !isFinite(maxX)) return null;
        return { minX, minY, maxX, maxY };
    }

    // Apply the script's bbox-to-screen transform: mirror X, scale, add asymmetric padding.
    function transformBboxToScreen(bbox, scaleX, scaleY, offsetX, offsetY, paddingRatio) {
        const tempMinX = (1 - bbox.maxX) * scaleX + offsetX;
        const tempMaxX = (1 - bbox.minX) * scaleX + offsetX;
        let minX = tempMinX;
        let maxX = tempMaxX;
        let minY = bbox.minY * scaleY + offsetY;
        let maxY = bbox.maxY * scaleY + offsetY;
        const padding = (maxX - minX) * paddingRatio;
        minX -= padding;
        maxX += padding;
        minY -= padding * 0.5;
        maxY += padding * 0.5;
        return { minX, minY, maxX, maxY };
    }

    // Exponential smoothing of a landmark array. Returns the new smoothed array (mutates `dst` if provided & compatible).
    // alpha=0 means frozen (no update), alpha=1 means snap-to-current.
    function smoothLandmarks(prev, current, alpha) {
        if (!prev || prev.length !== current.length) {
            return current.map(pt => ({ x: pt.x, y: pt.y, z: pt.z }));
        }
        const out = prev;
        for (let i = 0; i < current.length; i++) {
            out[i].x += (current[i].x - out[i].x) * alpha;
            out[i].y += (current[i].y - out[i].y) * alpha;
            out[i].z += (current[i].z - out[i].z) * alpha;
        }
        return out;
    }

    // Compute visible brick grid range for a face region.
    function brickGridRange(faceX, faceY, faceW, faceH, brickW, brickH, mortar) {
        const colStep = brickW + mortar;
        const rowStep = brickH + mortar;
        return {
            startCol: Math.floor(faceX / colStep) - 1,
            endCol:   Math.ceil((faceX + faceW) / colStep) + 1,
            startRow: Math.floor(faceY / rowStep) - 1,
            endRow:   Math.ceil((faceY + faceH) / rowStep) + 1
        };
    }

    // Eye openness ratio used to darken the upper-lid shadow.
    function eyeOpenness(eyeW, eyeH) {
        return eyeH / Math.max(eyeW, 1);
    }

    // Closed when the openness ratio drops below threshold (default ~0.2).
    // MediaPipe wide-open eyes sit around 0.4–0.6; a relaxed blink falls under 0.2.
    function isEyeClosed(eyeW, eyeH, threshold) {
        const t = (typeof threshold === 'number') ? threshold : 0.2;
        return eyeOpenness(eyeW, eyeH) < t;
    }

    // Eye Aspect Ratio (EAR) — Soukupová & Čech 2016.
    // Six points around the eye: outer corner (p1), upper lid (p2, p3),
    // inner corner (p4), lower lid (p5, p6). Returns (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||).
    // Works on normalized or pixel coords as long as inputs share a unit.
    function eyeAspectRatio(p1, p2, p3, p4, p5, p6) {
        function dist(a, b) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        const horizontal = dist(p1, p4);
        if (horizontal <= 0) return 0;
        return (dist(p2, p6) + dist(p3, p5)) / (2 * horizontal);
    }

    // Closed when EAR drops below threshold. Open eyes ~0.30+, blinks ~0.10–0.18.
    function isEyeClosedByEAR(ear, threshold) {
        const t = (typeof threshold === 'number') ? threshold : 0.18;
        return ear < t;
    }

    // Pull the 6 EAR landmarks for an eye out of a MediaPipe keypoints array.
    // `eyeIndices` follows the script's ordered convention:
    // [outer, top1, top2, top3, inner, bottom1, bottom2, bottom3]
    // We use outer/inner as horizontal corners and the middle pair from each lid.
    function earFromEyeIndices(keypoints, eyeIndices) {
        if (!keypoints || !eyeIndices || eyeIndices.length < 8) return 0;
        const outer  = keypoints[eyeIndices[0]];
        const top1   = keypoints[eyeIndices[1]];
        const top2   = keypoints[eyeIndices[2]];
        const inner  = keypoints[eyeIndices[4]];
        const bot1   = keypoints[eyeIndices[5]];
        const bot2   = keypoints[eyeIndices[6]];
        if (!outer || !top1 || !top2 || !inner || !bot1 || !bot2) return 0;
        return eyeAspectRatio(outer, top1, top2, inner, bot1, bot2);
    }

    // Iris placement relative to eye bounds (matches drawEye()).
    function irisGeometry(cx, cy, eyeW, eyeH) {
        return {
            irisD: eyeW * 0.55,
            irisX: cx,
            irisY: cy + eyeH * 0.05
        };
    }

    // Centroid of a list of {x,y}.
    function centroid(points) {
        if (!points || points.length === 0) return null;
        let cx = 0, cy = 0;
        for (const p of points) { cx += p.x; cy += p.y; }
        return { x: cx / points.length, y: cy / points.length };
    }

    return {
        SILHOUETTE_INDICES,
        LEFT_EYE_ORDERED,
        RIGHT_EYE_ORDERED,
        MOUTH_INDICES,
        clamp,
        mirrorAndScale,
        computeFit,
        bboxFromKeypoints,
        transformBboxToScreen,
        smoothLandmarks,
        brickGridRange,
        eyeOpenness,
        isEyeClosed,
        eyeAspectRatio,
        isEyeClosedByEAR,
        earFromEyeIndices,
        irisGeometry,
        centroid
    };
});
