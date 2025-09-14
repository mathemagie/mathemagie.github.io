let brickColorBase;
let mortarColor;
let shadowColorBase;
let lightShiftOffset = 0;
let animationTime = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    brickColorBase = color(180, 60, 50); // Red brick color
    shadowColorBase = color(120, 40, 35); // Darker red for shadows
    mortarColor = color(220, 220, 210); // Light gray mortar color
    noStroke();
}

function draw() {
    background(245, 245, 245); // Light background

    animationTime += 0.02;

    // Simple lighting effect
    lightShiftOffset = sin(animationTime) * 0.05;

    let brickWidth = width / 8;
    let brickHeight = brickWidth * 0.5;
    let mortarThickness = 3;

    let numCols = ceil(width / (brickWidth + mortarThickness)) + 1;
    let numRows = ceil(height / (brickHeight + mortarThickness)) + 1;

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            push();

            // Staggered brick pattern
            let xOffset = (r % 2 === 0) ? 0 : -(brickWidth + mortarThickness) * 0.5;
            let baseX = c * (brickWidth + mortarThickness) + xOffset;
            let baseY = r * (brickHeight + mortarThickness);

            // Simple floating motion
            let floatX = sin(animationTime * 0.5 + r * 0.3 + c * 0.2) * 1;
            let floatY = cos(animationTime * 0.3 + r * 0.2 + c * 0.1) * 0.8;

            translate(baseX + floatX, baseY + floatY);

            drawBrick(brickWidth, brickHeight, lightShiftOffset, r, c, animationTime);

            pop();
        }
    }
}

function drawBrick(w, h, lightOffset, row, col, time) {
    // Simple brick color with lighting
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

    // Main brick
    fill(currentBrickColor);
    rect(0, 0, w, h, 2);

    // Simple shadows
    fill(currentShadowColor);
    rect(0, h * 0.8, w, h * 0.2); // Bottom shadow
    rect(w * 0.8, 0, w * 0.2, h); // Right shadow

    // Simple highlight
    fill(
        constrain(red(currentBrickColor) + 30, 0, 255),
        constrain(green(currentBrickColor) + 20, 0, 255),
        constrain(blue(currentBrickColor) + 15, 0, 255),
        100
    );
    rect(0, 0, w * 0.3, h * 0.3, 1);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}