'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const lib = require('../js/lib.js');

test('clamp keeps value within bounds', () => {
    assert.equal(lib.clamp(5, 0, 10), 5);
    assert.equal(lib.clamp(-3, 0, 10), 0);
    assert.equal(lib.clamp(99, 0, 10), 10);
    assert.equal(lib.clamp(0, 0, 10), 0);
    assert.equal(lib.clamp(10, 0, 10), 10);
});

test('mirrorAndScale mirrors X and scales correctly', () => {
    // Point at x=0 should land at offsetX + scaleX (full mirror).
    const a = lib.mirrorAndScale({ x: 0, y: 0 }, 100, 200, 10, 20);
    assert.deepEqual(a, { x: 110, y: 20 });

    // Point at x=1 should land at offsetX exactly.
    const b = lib.mirrorAndScale({ x: 1, y: 1 }, 100, 200, 10, 20);
    assert.deepEqual(b, { x: 10, y: 220 });

    // Centered point stays centered horizontally.
    const c = lib.mirrorAndScale({ x: 0.5, y: 0.5 }, 100, 200, 0, 0);
    assert.deepEqual(c, { x: 50, y: 100 });
});

test('computeFit handles wider screen than video (letterbox top/bottom)', () => {
    // 16:9 screen, 4:3 video → screen aspect 1.78 > video aspect 1.33
    const fit = lib.computeFit(1600, 900, 640, 480);
    assert.equal(fit.drawWidth, 1600);
    // 1600 / (640/480) = 1200
    assert.equal(fit.drawHeight, 1200);
    assert.equal(fit.offsetX, 0);
    // (900 - 1200) / 2 = -150
    assert.equal(fit.offsetY, -150);
});

test('computeFit handles taller screen than video (letterbox left/right)', () => {
    // Portrait screen, 4:3 video
    const fit = lib.computeFit(480, 800, 640, 480);
    assert.equal(fit.drawHeight, 800);
    // 800 * (640/480) ≈ 1066.67
    assert.ok(Math.abs(fit.drawWidth - (800 * 640 / 480)) < 1e-9);
    assert.equal(fit.offsetY, 0);
    assert.ok(fit.offsetX < 0);
});

test('computeFit returns zeros when video has no dimensions', () => {
    const fit = lib.computeFit(800, 600, 0, 0);
    assert.deepEqual(fit, { drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 });
});

test('bboxFromKeypoints computes min/max ignoring null entries', () => {
    const pts = [
        { x: 0.1, y: 0.2 },
        null,
        { x: 0.8, y: 0.3 },
        { x: 0.4, y: 0.9 }
    ];
    const bbox = lib.bboxFromKeypoints(pts);
    assert.ok(Math.abs(bbox.minX - 0.1) < 1e-9);
    assert.ok(Math.abs(bbox.maxX - 0.8) < 1e-9);
    assert.ok(Math.abs(bbox.minY - 0.2) < 1e-9);
    assert.ok(Math.abs(bbox.maxY - 0.9) < 1e-9);
});

test('bboxFromKeypoints returns null for empty input', () => {
    assert.equal(lib.bboxFromKeypoints([]), null);
    assert.equal(lib.bboxFromKeypoints(null), null);
    assert.equal(lib.bboxFromKeypoints([null, null]), null);
});

test('transformBboxToScreen mirrors and pads correctly', () => {
    const bbox = { minX: 0.25, maxX: 0.75, minY: 0.1, maxY: 0.9 };
    const out = lib.transformBboxToScreen(bbox, 100, 200, 0, 0, 0);
    // No padding case: mirrored, so screen minX = (1-0.75)*100 = 25, maxX = (1-0.25)*100 = 75
    assert.equal(out.minX, 25);
    assert.equal(out.maxX, 75);
    assert.equal(out.minY, 0.1 * 200);
    assert.equal(out.maxY, 0.9 * 200);

    // With 15% padding (matches script.js).
    const padded = lib.transformBboxToScreen(bbox, 100, 200, 0, 0, 0.15);
    const width = 75 - 25;
    const pad = width * 0.15;
    assert.ok(Math.abs(padded.minX - (25 - pad)) < 1e-9);
    assert.ok(Math.abs(padded.maxX - (75 + pad)) < 1e-9);
    assert.ok(Math.abs(padded.minY - (0.1 * 200 - pad * 0.5)) < 1e-9);
    assert.ok(Math.abs(padded.maxY - (0.9 * 200 + pad * 0.5)) < 1e-9);
});

test('smoothLandmarks seeds when prev is missing or wrong length', () => {
    const curr = [{ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }];
    const seeded = lib.smoothLandmarks(null, curr, 0.5);
    assert.equal(seeded.length, 2);
    assert.deepEqual(seeded[0], { x: 1, y: 2, z: 3 });
    // Must be a copy, not the same references.
    assert.notEqual(seeded[0], curr[0]);

    const wrongLen = [{ x: 9, y: 9, z: 9 }];
    const reseeded = lib.smoothLandmarks(wrongLen, curr, 0.5);
    assert.equal(reseeded.length, 2);
    assert.deepEqual(reseeded[1], { x: 4, y: 5, z: 6 });
});

test('smoothLandmarks lerps toward current with alpha', () => {
    const prev = [{ x: 0, y: 0, z: 0 }];
    const curr = [{ x: 10, y: 20, z: 30 }];
    const out = lib.smoothLandmarks(prev, curr, 0.5);
    assert.deepEqual(out[0], { x: 5, y: 10, z: 15 });
    // Mutates in place.
    assert.equal(out, prev);
});

test('smoothLandmarks with alpha=0 is frozen, alpha=1 snaps', () => {
    const frozen = lib.smoothLandmarks([{ x: 0, y: 0, z: 0 }], [{ x: 99, y: 99, z: 99 }], 0);
    assert.deepEqual(frozen[0], { x: 0, y: 0, z: 0 });

    const snapped = lib.smoothLandmarks([{ x: 0, y: 0, z: 0 }], [{ x: 99, y: 99, z: 99 }], 1);
    assert.deepEqual(snapped[0], { x: 99, y: 99, z: 99 });
});

test('brickGridRange returns inclusive bounds with a 1-cell margin', () => {
    // brickW=100, brickH=50, mortar=5 → colStep=105, rowStep=55
    const r = lib.brickGridRange(210, 110, 105, 55, 100, 50, 5);
    // startCol = floor(210/105)-1 = 1, endCol = ceil(315/105)+1 = 4
    assert.equal(r.startCol, 1);
    assert.equal(r.endCol, 4);
    // startRow = floor(110/55)-1 = 1, endRow = ceil(165/55)+1 = 4
    assert.equal(r.startRow, 1);
    assert.equal(r.endRow, 4);
});

test('eyeOpenness ratio is heightHover/width-ish', () => {
    assert.equal(lib.eyeOpenness(100, 15), 0.15);
    assert.equal(lib.eyeOpenness(100, 50), 0.5);
    // Guards divide-by-zero.
    assert.equal(lib.eyeOpenness(0, 10), 10);
});

test('isEyeClosed flips below the openness threshold', () => {
    // Wide open ~0.5 → not closed
    assert.equal(lib.isEyeClosed(100, 50), false);
    // Squinty/blink ~0.15 → closed
    assert.equal(lib.isEyeClosed(100, 15), true);
    // Right at default threshold (0.2) is NOT closed (strict <)
    assert.equal(lib.isEyeClosed(100, 20), false);
    // Custom threshold lets callers tune sensitivity.
    assert.equal(lib.isEyeClosed(100, 30, 0.4), true);
    assert.equal(lib.isEyeClosed(100, 30, 0.25), false);
});

test('eyeAspectRatio computes (vertical avg) / (2 * horizontal)', () => {
    // Symmetric eye: corners at (0,0)-(10,0), lids at y=±2
    const ear = lib.eyeAspectRatio(
        { x: 0,  y: 0 },   // p1 outer corner
        { x: 3,  y: -2 },  // p2 upper lid
        { x: 7,  y: -2 },  // p3 upper lid
        { x: 10, y: 0 },   // p4 inner corner
        { x: 7,  y: 2 },   // p5 lower lid
        { x: 3,  y: 2 }    // p6 lower lid
    );
    // (4 + 4) / (2 * 10) = 0.4 — wide-open
    assert.ok(Math.abs(ear - 0.4) < 1e-9);

    // Closed lids → ~0
    const closed = lib.eyeAspectRatio(
        { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 7, y: 0 },
        { x: 10, y: 0 }, { x: 7, y: 0 }, { x: 3, y: 0 }
    );
    assert.equal(closed, 0);

    // Degenerate horizontal → returns 0 (no NaN).
    assert.equal(lib.eyeAspectRatio(
        { x: 5, y: 0 }, { x: 5, y: -1 }, { x: 5, y: -1 },
        { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 1 }
    ), 0);
});

test('isEyeClosedByEAR uses 0.18 default threshold', () => {
    assert.equal(lib.isEyeClosedByEAR(0.30), false);    // wide open
    assert.equal(lib.isEyeClosedByEAR(0.10), true);     // blink
    assert.equal(lib.isEyeClosedByEAR(0.18), false);    // strict <
    assert.equal(lib.isEyeClosedByEAR(0.25, 0.30), true);  // custom threshold
});

test('earFromEyeIndices pulls 6 EAR points from a MediaPipe-style array', () => {
    // Build a sparse keypoints array indexed by the LEFT_EYE_ORDERED set.
    const kp = new Array(468).fill(null);
    const idx = lib.LEFT_EYE_ORDERED; // [outer, t1, t2, t3, inner, b1, b2, b3]
    kp[idx[0]] = { x: 0,    y: 0 };     // outer
    kp[idx[1]] = { x: 0.03, y: -0.02 }; // top1
    kp[idx[2]] = { x: 0.07, y: -0.02 }; // top2
    kp[idx[4]] = { x: 0.10, y: 0 };     // inner
    kp[idx[5]] = { x: 0.07, y: 0.02 };  // bottom2 (per script convention)
    kp[idx[6]] = { x: 0.03, y: 0.02 };  // bottom1
    const ear = lib.earFromEyeIndices(kp, idx);
    // (0.04 + 0.04) / (2 * 0.10) = 0.4
    assert.ok(Math.abs(ear - 0.4) < 1e-9);

    // Missing landmarks → 0 (defensive, no crash).
    assert.equal(lib.earFromEyeIndices(null, idx), 0);
    assert.equal(lib.earFromEyeIndices(kp, null), 0);
    const missing = kp.slice();
    missing[idx[1]] = null;
    assert.equal(lib.earFromEyeIndices(missing, idx), 0);
});

test('irisGeometry sizes iris to ~55% of eye width and nudges down', () => {
    const g = lib.irisGeometry(50, 100, 40, 20);
    assert.equal(g.irisD, 22);
    assert.equal(g.irisX, 50);
    assert.equal(g.irisY, 101);
});

test('centroid averages points', () => {
    const c = lib.centroid([
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: 20, y: 40 }
    ]);
    assert.deepEqual(c, { x: 10, y: 20 });
    assert.equal(lib.centroid([]), null);
    assert.equal(lib.centroid(null), null);
});

test('landmark index sets are well-formed and within MediaPipe range (0..467)', () => {
    const allSets = [
        lib.SILHOUETTE_INDICES,
        lib.LEFT_EYE_ORDERED,
        lib.RIGHT_EYE_ORDERED,
        lib.MOUTH_INDICES
    ];
    for (const arr of allSets) {
        assert.ok(Array.isArray(arr) && arr.length > 0);
        for (const idx of arr) {
            assert.equal(Number.isInteger(idx), true);
            assert.ok(idx >= 0 && idx < 468, `index ${idx} out of MediaPipe FaceMesh range`);
        }
    }
    // Silhouette is a closed polygon — first and last index match.
    assert.equal(lib.SILHOUETTE_INDICES[0], lib.SILHOUETTE_INDICES[lib.SILHOUETTE_INDICES.length - 1]);
    // Eye index sets are 8 points (outer→top→inner→bottom).
    assert.equal(lib.LEFT_EYE_ORDERED.length, 8);
    assert.equal(lib.RIGHT_EYE_ORDERED.length, 8);
    // Left and right eyes share no indices.
    const overlap = lib.LEFT_EYE_ORDERED.filter(i => lib.RIGHT_EYE_ORDERED.includes(i));
    assert.deepEqual(overlap, []);
});
