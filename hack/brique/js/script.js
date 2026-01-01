let brickColorBase;
let shadowColorBase;
let lightShiftOffset = 0;
let animationTime = 0;

let faceMesh;
let pose;
let camera;
let faces = [];
let bodyPose = null;
let modelReady = false;
let poseReady = false;
let videoReady = false;
let videoElement;

// Mortar color toggle
let whiteMortar = false;
let mortarButton;

// Skeleton toggle
let showSkeleton = false;
let skeletonButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    brickColorBase = color(180, 60, 50);
    shadowColorBase = color(120, 40, 35);
    noStroke();

    videoElement = document.getElementById('video');

    // Initialize MediaPipe FaceMesh
    faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceResults);

    // Initialize MediaPipe Pose
    pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);

    // Initialize camera
    camera = new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
            await pose.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    camera.start().then(() => {
        console.log('Camera ready');
        videoReady = true;
        modelReady = true;
        poseReady = true;
        console.log('FaceMesh and Pose models loaded!');
    });

    // Create mortar color toggle button (hidden by default, shown with H key)
    mortarButton = createButton('Joints: Noir');
    mortarButton.position(20, 20);
    mortarButton.style('padding', '10px 20px');
    mortarButton.style('font-size', '14px');
    mortarButton.style('background-color', '#333');
    mortarButton.style('color', 'white');
    mortarButton.style('border', '2px solid white');
    mortarButton.style('border-radius', '5px');
    mortarButton.style('cursor', 'pointer');
    mortarButton.mousePressed(toggleMortarColor);
    mortarButton.hide();

    // Create skeleton toggle button (hidden by default, shown with H key)
    skeletonButton = createButton('Squelette: Off');
    skeletonButton.position(20, 70);
    skeletonButton.style('padding', '10px 20px');
    skeletonButton.style('font-size', '14px');
    skeletonButton.style('background-color', '#333');
    skeletonButton.style('color', 'white');
    skeletonButton.style('border', '2px solid white');
    skeletonButton.style('border-radius', '5px');
    skeletonButton.style('cursor', 'pointer');
    skeletonButton.mousePressed(toggleSkeleton);
    skeletonButton.hide();
}

let helpPanelVisible = false;

function keyPressed() {
    if (key === 'h' || key === 'H') {
        helpPanelVisible = !helpPanelVisible;
        if (helpPanelVisible) {
            mortarButton.show();
            skeletonButton.show();
        } else {
            mortarButton.hide();
            skeletonButton.hide();
        }
    }
}

function toggleMortarColor() {
    whiteMortar = !whiteMortar;
    if (whiteMortar) {
        mortarButton.html('Joints: Blanc');
        mortarButton.style('background-color', 'white');
        mortarButton.style('color', 'black');
        mortarButton.style('border', '2px solid black');
    } else {
        mortarButton.html('Joints: Noir');
        mortarButton.style('background-color', '#333');
        mortarButton.style('color', 'white');
        mortarButton.style('border', '2px solid white');
    }
}

function toggleSkeleton() {
    showSkeleton = !showSkeleton;
    if (showSkeleton) {
        skeletonButton.html('Squelette: On');
        skeletonButton.style('background-color', '#8B4513');
        skeletonButton.style('color', 'white');
        skeletonButton.style('border', '2px solid #DEB887');
    } else {
        skeletonButton.html('Squelette: Off');
        skeletonButton.style('background-color', '#333');
        skeletonButton.style('color', 'white');
        skeletonButton.style('border', '2px solid white');
    }
}

function onFaceResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        faces = results.multiFaceLandmarks;
    } else {
        faces = [];
    }
}

function onPoseResults(results) {
    if (results.poseLandmarks) {
        bodyPose = results.poseLandmarks;
    } else {
        bodyPose = null;
    }
}

function draw() {
    if (whiteMortar) {
        background(220, 220, 215);
    } else {
        background(20, 20, 25);
    }
    animationTime += 0.02;
    lightShiftOffset = sin(animationTime) * 0.05;

    if (!videoElement || videoElement.videoWidth === 0) {
        drawBackgroundBricks();
        drawLoadingMessage("Initializing camera...");
        return;
    }

    let videoAspect = videoElement.videoWidth / videoElement.videoHeight;
    let screenAspect = width / height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (screenAspect > videoAspect) {
        drawWidth = width;
        drawHeight = width / videoAspect;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
    } else {
        drawHeight = height;
        drawWidth = height * videoAspect;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
    }

    let scaleX = drawWidth;
    let scaleY = drawHeight;

    if (faces.length > 0 && modelReady) {
        drawBackgroundBricks();

        // Process each detected face
        for (let faceIdx = 0; faceIdx < faces.length; faceIdx++) {
            let keypoints = faces[faceIdx];

            if (!keypoints || keypoints.length === 0) {
                continue;
            }

            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;

            for (let i = 0; i < keypoints.length; i++) {
                let pt = keypoints[i];
                if (!pt) continue;
                // MediaPipe returns normalized coordinates (0-1)
                let x = pt.x;
                let y = pt.y;
                minX = min(minX, x);
                minY = min(minY, y);
                maxX = max(maxX, x);
                maxY = max(maxY, y);
            }

            if (!isFinite(minX) || !isFinite(maxX)) {
                continue;
            }

            // Mirror X and scale to screen coordinates
            let tempMinX = (1 - maxX) * scaleX + offsetX;
            let tempMaxX = (1 - minX) * scaleX + offsetX;
            minX = tempMinX;
            maxX = tempMaxX;
            minY = minY * scaleY + offsetY;
            maxY = maxY * scaleY + offsetY;

            let padding = (maxX - minX) * 0.15;
            minX -= padding;
            maxX += padding;
            minY -= padding * 0.5;
            maxY += padding * 0.5;

            let faceWidth = maxX - minX;
            let faceHeight = maxY - minY;
            let faceCenterX = (minX + maxX) / 2;
            let faceCenterY = (minY + maxY) / 2;

            let silhouetteIndices = [
                10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
            ];

            // Get silhouette points for reuse
            let silhouettePoints = [];
            for (let i = 0; i < silhouetteIndices.length; i++) {
                let idx = silhouetteIndices[i];
                if (idx < keypoints.length && keypoints[idx]) {
                    let pt = keypoints[idx];
                    let x = (1 - pt.x) * scaleX + offsetX;
                    let y = pt.y * scaleY + offsetY;
                    silhouettePoints.push({x, y});
                }
            }

            // Draw 3D extrusion effect - multiple shadow layers
            let extrudeDepth = faceWidth * 0.08;
            let numLayers = 12;

            for (let layer = numLayers; layer >= 0; layer--) {
                let layerOffset = (layer / numLayers) * extrudeDepth;
                let darkness = map(layer, 0, numLayers, 0.4, 0.1);

                push();
                fill(red(brickColorBase) * darkness, green(brickColorBase) * darkness, blue(brickColorBase) * darkness);
                noStroke();
                beginShape();
                for (let pt of silhouettePoints) {
                    // Offset down and right for 3D depth effect
                    vertex(pt.x + layerOffset * 0.5, pt.y + layerOffset);
                }
                endShape(CLOSE);
                pop();
            }

            // Draw the face bricks (the protruding surface)
            push();
            drawingContext.save();
            drawingContext.beginPath();

            let firstPoint = true;
            for (let pt of silhouettePoints) {
                if (firstPoint) {
                    drawingContext.moveTo(pt.x, pt.y);
                    firstPoint = false;
                } else {
                    drawingContext.lineTo(pt.x, pt.y);
                }
            }

            drawingContext.closePath();
            drawingContext.clip();
            drawFaceBricks(minX, minY, faceWidth, faceHeight, faceCenterX, faceCenterY);
            drawingContext.restore();
            pop();

            // Add highlight edge on top-left for 3D pop effect
            push();
            noFill();
            stroke(255, 100, 80, 80);
            strokeWeight(3);
            beginShape();
            for (let i = 0; i < silhouettePoints.length * 0.4; i++) {
                let pt = silhouettePoints[i];
                vertex(pt.x, pt.y);
            }
            endShape();
            pop();

            drawEyeHoles(keypoints, scaleX, scaleY, offsetX, offsetY);
        }

        // Draw skeleton based on body pose (only once, not per face) - only if enabled
        if (showSkeleton && bodyPose) {
            drawAnimatedSkeleton(bodyPose, scaleX, scaleY, offsetX, offsetY);
        }

    } else {
        drawBackgroundBricks();
        if (!videoReady) {
            drawLoadingMessage("Initializing camera...");
        } else if (!modelReady) {
            drawLoadingMessage("Loading face model...");
        } else {
            drawLoadingMessage("Looking for face...");
        }
    }
}

function drawLoadingMessage(msg) {
    if (whiteMortar) {
        fill(50, 50, 50, 200);
    } else {
        fill(255, 255, 255, 150);
    }
    textAlign(CENTER, CENTER);
    textSize(24);
    text(msg, width / 2, height / 2);
}

function drawBackgroundBricks() {
    let brickWidth = width / 12;
    let brickHeight = brickWidth * 0.5;
    let mortarThickness = 5;
    let numCols = ceil(width / (brickWidth + mortarThickness)) + 1;
    let numRows = ceil(height / (brickHeight + mortarThickness)) + 1;

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            push();
            let xOffset = (r % 2 === 0) ? 0 : -(brickWidth + mortarThickness) * 0.5;
            let baseX = c * (brickWidth + mortarThickness) + xOffset;
            let baseY = r * (brickHeight + mortarThickness);
            let floatX = sin(animationTime * 0.3 + r * 0.2 + c * 0.15) * 2;
            let floatY = cos(animationTime * 0.2 + r * 0.15 + c * 0.1) * 1.5;
            translate(baseX + floatX, baseY + floatY);
            // Use row and col as seed for consistent texture per brick
            let brickSeed = r * 100 + c;
            drawBrick(brickWidth, brickHeight, lightShiftOffset - 0.3, brickSeed);
            pop();
        }
    }
}

function drawFaceBricks(faceX, faceY, faceWidth, faceHeight, centerX, centerY) {
    let brickWidth = faceWidth / 6;
    let brickHeight = brickWidth * 0.5;
    let mortarThickness = 3;
    let numCols = ceil(faceWidth / (brickWidth + mortarThickness)) + 2;
    let numRows = ceil(faceHeight / (brickHeight + mortarThickness)) + 2;

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            push();
            let xOffset = (r % 2 === 0) ? 0 : -(brickWidth + mortarThickness) * 0.5;
            let baseX = faceX + c * (brickWidth + mortarThickness) + xOffset;
            let baseY = faceY + r * (brickHeight + mortarThickness);
            let floatX = sin(animationTime * 0.5 + r * 0.3 + c * 0.2) * 3;
            let floatY = cos(animationTime * 0.4 + r * 0.25 + c * 0.15) * 2;
            let distFromCenter = dist(baseX, baseY, centerX, centerY);
            let maxDist = max(faceWidth, faceHeight) / 2;
            let distFactor = map(distFromCenter, 0, maxDist, 0.5, 1.5);
            translate(baseX + floatX * distFactor, baseY + floatY * distFactor);
            // Brighter bricks for the face (protruding surface catches more light)
            // Use row and col as seed for consistent texture per brick
            let brickSeed = r * 100 + c + 5000;
            drawBrick(brickWidth, brickHeight, lightShiftOffset + 0.3, brickSeed);
            pop();
        }
    }
}

function drawBrick(w, h, lightOffset, brickSeed) {
    // Use seed for consistent randomness per brick
    let seed = brickSeed || 0;

    let brightnessMultiplier = 1 + lightOffset;

    // Random color variation per brick
    let colorVar = (sin(seed * 12.9898) * 0.5 + 0.5) * 30 - 15;
    let baseR = constrain(red(brickColorBase) + colorVar, 100, 220);
    let baseG = constrain(green(brickColorBase) + colorVar * 0.5, 30, 100);
    let baseB = constrain(blue(brickColorBase) + colorVar * 0.3, 25, 80);

    let currentBrickColor = color(
        baseR * brightnessMultiplier,
        baseG * brightnessMultiplier,
        baseB * brightnessMultiplier
    );

    // Draw main brick body with rounded corners
    fill(currentBrickColor);
    rect(0, 0, w, h, 3);

    // Add texture - random spots and variations
    for (let i = 0; i < 8; i++) {
        let spotX = (sin(seed * 3.14 + i * 7.5) * 0.5 + 0.5) * w * 0.8 + w * 0.1;
        let spotY = (cos(seed * 2.71 + i * 5.3) * 0.5 + 0.5) * h * 0.7 + h * 0.15;
        let spotSize = (sin(seed + i * 2.1) * 0.5 + 0.5) * w * 0.15 + w * 0.05;
        let spotDark = (sin(seed * 1.5 + i) * 0.5 + 0.5) * 40 - 20;

        fill(
            constrain(red(currentBrickColor) + spotDark, 0, 255),
            constrain(green(currentBrickColor) + spotDark * 0.6, 0, 255),
            constrain(blue(currentBrickColor) + spotDark * 0.4, 0, 255),
            60
        );
        noStroke();
        ellipse(spotX, spotY, spotSize, spotSize * 0.7);
    }

    // Add grain/noise texture
    for (let i = 0; i < 12; i++) {
        let grainX = (sin(seed * 5.7 + i * 3.2) * 0.5 + 0.5) * w;
        let grainY = (cos(seed * 4.3 + i * 2.8) * 0.5 + 0.5) * h;
        let grainBright = (sin(seed * 2.1 + i) * 0.5 + 0.5) * 50 - 25;

        fill(
            constrain(red(currentBrickColor) + grainBright, 0, 255),
            constrain(green(currentBrickColor) + grainBright * 0.5, 0, 255),
            constrain(blue(currentBrickColor) + grainBright * 0.3, 0, 255),
            40
        );
        rect(grainX, grainY, w * 0.08, h * 0.1, 1);
    }

    // Bottom edge shadow (depth)
    let shadowColor = color(
        red(currentBrickColor) * 0.5,
        green(currentBrickColor) * 0.5,
        blue(currentBrickColor) * 0.5
    );
    fill(shadowColor);
    rect(0, h * 0.85, w, h * 0.15, 0, 0, 3, 3);

    // Right edge shadow
    fill(red(shadowColor), green(shadowColor), blue(shadowColor), 180);
    rect(w * 0.88, 0, w * 0.12, h, 0, 3, 3, 0);

    // Top-left highlight
    fill(255, 255, 255, 35);
    beginShape();
    vertex(0, h * 0.3);
    vertex(0, 0);
    vertex(w * 0.4, 0);
    vertex(w * 0.25, h * 0.15);
    vertex(w * 0.1, h * 0.2);
    endShape(CLOSE);

    // Subtle top edge highlight
    fill(255, 255, 255, 25);
    rect(w * 0.05, 0, w * 0.6, h * 0.08, 2);

    // Add some cracks/lines for weathering
    stroke(red(shadowColor) * 0.7, green(shadowColor) * 0.7, blue(shadowColor) * 0.7, 50);
    strokeWeight(0.5);
    if (sin(seed * 8.7) > 0.7) {
        let crackStartX = (sin(seed * 11.3) * 0.5 + 0.5) * w * 0.3;
        let crackStartY = (cos(seed * 9.2) * 0.5 + 0.5) * h * 0.5 + h * 0.25;
        line(crackStartX, crackStartY, crackStartX + w * 0.2, crackStartY - h * 0.15);
    }
    noStroke();
}

function drawAnimatedSkeleton(landmarks, scaleX, scaleY, offsetX, offsetY) {
    let boneColor = color(235, 230, 220);
    let boneShadow = color(180, 170, 155);
    let boneHighlight = color(255, 252, 245);

    // Helper function to get landmark position (mirrored for front camera)
    function getLandmark(idx) {
        if (landmarks[idx] && landmarks[idx].visibility > 0.3) {
            return {
                x: (1 - landmarks[idx].x) * scaleX + offsetX,
                y: landmarks[idx].y * scaleY + offsetY,
                visible: true
            };
        }
        return { x: 0, y: 0, visible: false };
    }

    // Get key body landmarks
    let leftShoulder = getLandmark(11);
    let rightShoulder = getLandmark(12);
    let leftElbow = getLandmark(13);
    let rightElbow = getLandmark(14);
    let leftWrist = getLandmark(15);
    let rightWrist = getLandmark(16);
    let leftHip = getLandmark(23);
    let rightHip = getLandmark(24);
    let leftKnee = getLandmark(25);
    let rightKnee = getLandmark(26);
    let leftAnkle = getLandmark(27);
    let rightAnkle = getLandmark(28);

    // Calculate body scale based on shoulder width
    let shoulderWidth = 100;
    if (leftShoulder.visible && rightShoulder.visible) {
        shoulderWidth = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y);
    }
    let boneThickness = shoulderWidth / 12;

    push();

    // Draw bone function
    function drawBone(x1, y1, x2, y2, thickness) {
        // Main bone
        stroke(boneShadow);
        strokeWeight(thickness);
        strokeCap(ROUND);
        line(x1, y1, x2, y2);

        // Highlight
        stroke(boneColor);
        strokeWeight(thickness * 0.6);
        line(x1, y1, x2, y2);

        // Joint spheres
        fill(boneColor);
        stroke(boneShadow);
        strokeWeight(1);
        ellipse(x1, y1, thickness * 1.5, thickness * 1.5);
        ellipse(x2, y2, thickness * 1.5, thickness * 1.5);
    }

    // Draw joint function
    function drawJoint(x, y, size) {
        fill(boneColor);
        stroke(boneShadow);
        strokeWeight(1);
        ellipse(x, y, size, size);
        fill(boneHighlight);
        noStroke();
        ellipse(x - size * 0.15, y - size * 0.15, size * 0.3, size * 0.3);
    }

    // Spine / Torso
    if (leftShoulder.visible && rightShoulder.visible && leftHip.visible && rightHip.visible) {
        let spineTop = {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
        };
        let spineBottom = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
        };

        // Draw ribcage area
        let ribCount = 6;
        for (let i = 0; i < ribCount; i++) {
            let t = i / ribCount;
            let ribY = lerp(spineTop.y + shoulderWidth * 0.1, spineBottom.y - shoulderWidth * 0.2, t);
            let ribWidth = shoulderWidth * (0.45 - t * 0.15);
            let ribCurve = shoulderWidth * 0.15;

            stroke(boneShadow);
            strokeWeight(boneThickness * 0.5);
            noFill();

            // Left rib
            beginShape();
            vertex(spineTop.x, ribY);
            bezierVertex(
                spineTop.x - ribWidth * 0.5, ribY + ribCurve * 0.5,
                spineTop.x - ribWidth, ribY + ribCurve,
                spineTop.x - ribWidth * 0.8, ribY + ribCurve * 1.5
            );
            endShape();

            // Right rib
            beginShape();
            vertex(spineTop.x, ribY);
            bezierVertex(
                spineTop.x + ribWidth * 0.5, ribY + ribCurve * 0.5,
                spineTop.x + ribWidth, ribY + ribCurve,
                spineTop.x + ribWidth * 0.8, ribY + ribCurve * 1.5
            );
            endShape();
        }

        // Spine vertebrae
        let spineSegments = 8;
        for (let i = 0; i <= spineSegments; i++) {
            let t = i / spineSegments;
            let vx = lerp(spineTop.x, spineBottom.x, t);
            let vy = lerp(spineTop.y, spineBottom.y, t);
            let vSize = boneThickness * (1.2 - t * 0.3);

            fill(boneColor);
            stroke(boneShadow);
            strokeWeight(1);
            ellipse(vx, vy, vSize * 1.5, vSize);

            fill(boneHighlight);
            noStroke();
            ellipse(vx - vSize * 0.2, vy - vSize * 0.1, vSize * 0.3, vSize * 0.2);
        }

        // Pelvis
        fill(boneColor);
        stroke(boneShadow);
        strokeWeight(2);
        beginShape();
        vertex(leftHip.x, leftHip.y);
        bezierVertex(
            leftHip.x, leftHip.y + shoulderWidth * 0.15,
            spineBottom.x - shoulderWidth * 0.1, spineBottom.y + shoulderWidth * 0.2,
            spineBottom.x, spineBottom.y + shoulderWidth * 0.1
        );
        bezierVertex(
            spineBottom.x + shoulderWidth * 0.1, spineBottom.y + shoulderWidth * 0.2,
            rightHip.x, rightHip.y + shoulderWidth * 0.15,
            rightHip.x, rightHip.y
        );
        bezierVertex(
            rightHip.x - shoulderWidth * 0.1, rightHip.y - shoulderWidth * 0.05,
            leftHip.x + shoulderWidth * 0.1, leftHip.y - shoulderWidth * 0.05,
            leftHip.x, leftHip.y
        );
        endShape(CLOSE);
    }

    // Clavicles
    if (leftShoulder.visible && rightShoulder.visible) {
        let neckBase = {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2 - shoulderWidth * 0.05
        };

        stroke(boneShadow);
        strokeWeight(boneThickness * 0.8);
        noFill();
        // Left clavicle
        bezier(neckBase.x, neckBase.y,
               neckBase.x - shoulderWidth * 0.15, neckBase.y - shoulderWidth * 0.05,
               leftShoulder.x + shoulderWidth * 0.1, leftShoulder.y - shoulderWidth * 0.05,
               leftShoulder.x, leftShoulder.y);
        // Right clavicle
        bezier(neckBase.x, neckBase.y,
               neckBase.x + shoulderWidth * 0.15, neckBase.y - shoulderWidth * 0.05,
               rightShoulder.x - shoulderWidth * 0.1, rightShoulder.y - shoulderWidth * 0.05,
               rightShoulder.x, rightShoulder.y);

        // Highlights
        stroke(boneColor);
        strokeWeight(boneThickness * 0.4);
        bezier(neckBase.x, neckBase.y - 2,
               neckBase.x - shoulderWidth * 0.15, neckBase.y - shoulderWidth * 0.05 - 2,
               leftShoulder.x + shoulderWidth * 0.1, leftShoulder.y - shoulderWidth * 0.05 - 2,
               leftShoulder.x, leftShoulder.y - 2);
        bezier(neckBase.x, neckBase.y - 2,
               neckBase.x + shoulderWidth * 0.15, neckBase.y - shoulderWidth * 0.05 - 2,
               rightShoulder.x - shoulderWidth * 0.1, rightShoulder.y - shoulderWidth * 0.05 - 2,
               rightShoulder.x, rightShoulder.y - 2);
    }

    // Arms
    // Left arm
    if (leftShoulder.visible && leftElbow.visible) {
        drawBone(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y, boneThickness);
    }
    if (leftElbow.visible && leftWrist.visible) {
        drawBone(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y, boneThickness * 0.8);
    }
    if (leftWrist.visible) {
        drawJoint(leftWrist.x, leftWrist.y, boneThickness * 1.2);
        // Hand bones
        let handSize = boneThickness * 2;
        for (let i = 0; i < 5; i++) {
            let angle = -PI/4 + (i * PI/8);
            let fingerLen = handSize * (i === 2 ? 1.2 : 0.9);
            stroke(boneShadow);
            strokeWeight(boneThickness * 0.3);
            let fx = leftWrist.x + cos(angle) * fingerLen;
            let fy = leftWrist.y + sin(angle) * fingerLen + handSize * 0.5;
            line(leftWrist.x, leftWrist.y + handSize * 0.3, fx, fy);
        }
    }

    // Right arm
    if (rightShoulder.visible && rightElbow.visible) {
        drawBone(rightShoulder.x, rightShoulder.y, rightElbow.x, rightElbow.y, boneThickness);
    }
    if (rightElbow.visible && rightWrist.visible) {
        drawBone(rightElbow.x, rightElbow.y, rightWrist.x, rightWrist.y, boneThickness * 0.8);
    }
    if (rightWrist.visible) {
        drawJoint(rightWrist.x, rightWrist.y, boneThickness * 1.2);
        // Hand bones
        let handSize = boneThickness * 2;
        for (let i = 0; i < 5; i++) {
            let angle = PI - (-PI/4 + (i * PI/8));
            let fingerLen = handSize * (i === 2 ? 1.2 : 0.9);
            stroke(boneShadow);
            strokeWeight(boneThickness * 0.3);
            let fx = rightWrist.x + cos(angle) * fingerLen;
            let fy = rightWrist.y + sin(angle) * fingerLen + handSize * 0.5;
            line(rightWrist.x, rightWrist.y + handSize * 0.3, fx, fy);
        }
    }

    // Legs
    // Left leg
    if (leftHip.visible && leftKnee.visible) {
        drawBone(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y, boneThickness * 1.1);
    }
    if (leftKnee.visible && leftAnkle.visible) {
        drawBone(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y, boneThickness);
    }
    if (leftAnkle.visible) {
        drawJoint(leftAnkle.x, leftAnkle.y, boneThickness * 1.3);
        // Foot
        stroke(boneShadow);
        strokeWeight(boneThickness * 0.6);
        line(leftAnkle.x, leftAnkle.y, leftAnkle.x - boneThickness * 1.5, leftAnkle.y + boneThickness * 2);
    }

    // Right leg
    if (rightHip.visible && rightKnee.visible) {
        drawBone(rightHip.x, rightHip.y, rightKnee.x, rightKnee.y, boneThickness * 1.1);
    }
    if (rightKnee.visible && rightAnkle.visible) {
        drawBone(rightKnee.x, rightKnee.y, rightAnkle.x, rightAnkle.y, boneThickness);
    }
    if (rightAnkle.visible) {
        drawJoint(rightAnkle.x, rightAnkle.y, boneThickness * 1.3);
        // Foot
        stroke(boneShadow);
        strokeWeight(boneThickness * 0.6);
        line(rightAnkle.x, rightAnkle.y, rightAnkle.x + boneThickness * 1.5, rightAnkle.y + boneThickness * 2);
    }

    // Shoulder joints (draw last to be on top)
    if (leftShoulder.visible) {
        drawJoint(leftShoulder.x, leftShoulder.y, boneThickness * 2);
    }
    if (rightShoulder.visible) {
        drawJoint(rightShoulder.x, rightShoulder.y, boneThickness * 2);
    }

    // Hip joints
    if (leftHip.visible) {
        drawJoint(leftHip.x, leftHip.y, boneThickness * 2);
    }
    if (rightHip.visible) {
        drawJoint(rightHip.x, rightHip.y, boneThickness * 2);
    }

    pop();
}

function drawEyeHoles(keypoints, scaleX, scaleY, offsetX, offsetY) {
    if (!keypoints || keypoints.length === 0) return;

    let leftEyeIndices = [33, 133, 160, 159, 158, 144, 145, 153];
    let rightEyeIndices = [362, 263, 387, 386, 385, 373, 374, 380];
    let eyeScale = 1.8; // Scale factor to make eyes bigger

    if (whiteMortar) {
        fill(220, 220, 215);
    } else {
        fill(10, 10, 15);
    }
    noStroke();

    // Calculate left eye center and draw scaled
    let leftCenterX = 0, leftCenterY = 0, leftCount = 0;
    for (let idx of leftEyeIndices) {
        if (idx < keypoints.length && keypoints[idx]) {
            let pt = keypoints[idx];
            leftCenterX += (1 - pt.x) * scaleX + offsetX;
            leftCenterY += pt.y * scaleY + offsetY;
            leftCount++;
        }
    }
    leftCenterX /= leftCount;
    leftCenterY /= leftCount;

    beginShape();
    for (let idx of leftEyeIndices) {
        if (idx < keypoints.length && keypoints[idx]) {
            let pt = keypoints[idx];
            let x = (1 - pt.x) * scaleX + offsetX;
            let y = pt.y * scaleY + offsetY;
            // Scale from center
            x = leftCenterX + (x - leftCenterX) * eyeScale;
            y = leftCenterY + (y - leftCenterY) * eyeScale;
            vertex(x, y);
        }
    }
    endShape(CLOSE);

    // Calculate right eye center and draw scaled
    let rightCenterX = 0, rightCenterY = 0, rightCount = 0;
    for (let idx of rightEyeIndices) {
        if (idx < keypoints.length && keypoints[idx]) {
            let pt = keypoints[idx];
            rightCenterX += (1 - pt.x) * scaleX + offsetX;
            rightCenterY += pt.y * scaleY + offsetY;
            rightCount++;
        }
    }
    rightCenterX /= rightCount;
    rightCenterY /= rightCount;

    beginShape();
    for (let idx of rightEyeIndices) {
        if (idx < keypoints.length && keypoints[idx]) {
            let pt = keypoints[idx];
            let x = (1 - pt.x) * scaleX + offsetX;
            let y = pt.y * scaleY + offsetY;
            // Scale from center
            x = rightCenterX + (x - rightCenterX) * eyeScale;
            y = rightCenterY + (y - rightCenterY) * eyeScale;
            vertex(x, y);
        }
    }
    endShape(CLOSE);

    let mouthIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    if (whiteMortar) {
        fill(220, 220, 215);
    } else {
        fill(5, 5, 10);
    }
    beginShape();
    for (let idx of mouthIndices) {
        if (idx < keypoints.length && keypoints[idx]) {
            let pt = keypoints[idx];
            vertex((1 - pt.x) * scaleX + offsetX, pt.y * scaleY + offsetY);
        }
    }
    endShape(CLOSE);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
