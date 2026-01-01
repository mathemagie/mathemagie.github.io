let brickColorBase;
let shadowColorBase;
let lightShiftOffset = 0;
let animationTime = 0;

let faceMesh;
let camera;
let faces = [];
let modelReady = false;
let videoReady = false;
let videoElement;

// Mortar color toggle
let whiteMortar = false;
let mortarButton;

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

    faceMesh.onResults(onResults);

    // Initialize camera
    camera = new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    camera.start().then(() => {
        console.log('Camera ready');
        videoReady = true;
        modelReady = true;
        console.log('FaceMesh model loaded!');
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
}

let helpPanelVisible = false;

function keyPressed() {
    if (key === 'h' || key === 'H') {
        helpPanelVisible = !helpPanelVisible;
        if (helpPanelVisible) {
            mortarButton.show();
        } else {
            mortarButton.hide();
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

function onResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        faces = results.multiFaceLandmarks;
    } else {
        faces = [];
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
    let mortarThickness = 4;
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
            let brightness = 0.6 + lightShiftOffset;
            fill(red(brickColorBase) * brightness, green(brickColorBase) * brightness, blue(brickColorBase) * brightness);
            rect(0, 0, brickWidth, brickHeight, 2);
            pop();
        }
    }
}

function drawFaceBricks(faceX, faceY, faceWidth, faceHeight, centerX, centerY) {
    let brickWidth = faceWidth / 6;
    let brickHeight = brickWidth * 0.5;
    let mortarThickness = 2;
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
            drawBrick(brickWidth, brickHeight, lightShiftOffset + 0.3);
            pop();
        }
    }
}

function drawBrick(w, h, lightOffset) {
    let brightnessMultiplier = 1 + lightOffset;
    let currentBrickColor = color(
        red(brickColorBase) * brightnessMultiplier,
        green(brickColorBase) * brightnessMultiplier,
        blue(brickColorBase) * brightnessMultiplier
    );
    let currentShadowColor = color(
        red(shadowColorBase) * brightnessMultiplier * 0.7,
        green(shadowColorBase) * brightnessMultiplier * 0.7,
        blue(shadowColorBase) * brightnessMultiplier * 0.7
    );

    fill(currentBrickColor);
    rect(0, 0, w, h, 2);
    fill(currentShadowColor);
    rect(0, h * 0.8, w, h * 0.2);
    rect(w * 0.8, 0, w * 0.2, h);
    fill(constrain(red(currentBrickColor) + 30, 0, 255), constrain(green(currentBrickColor) + 20, 0, 255), constrain(blue(currentBrickColor) + 15, 0, 255), 100);
    rect(0, 0, w * 0.3, h * 0.3, 1);
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
