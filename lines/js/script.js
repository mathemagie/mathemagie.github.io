/* global createCanvas, colorMode, HSB, strokeWeight, mouseX, mouseY, mouseIsPressed, LEFT, 
   random, TWO_PI, cos, sin, width, height, min, dist, stroke, line, push, pop, translate, 
   fill, noStroke, rect, ellipse, lerp, map, background, windowWidth, windowHeight, 
   resizeCanvas, noLoop, rectMode, CENTER, color, noFill */

// Define the maximum number of lines we want on the screen
let maxLines = 100; // Renamed from maxDots
let drawSpeed = 0.2; // Control the speed of adding new lines
let lines = []; // Array to store line data (Renamed from dots)
const removalRadius = 50; // Radius around the mouse/touch to remove lines
window.currentRemovalRadius = removalRadius; // Global variable for dynamic eraser size
let lastFrameTime = 0; // For tracking time between frames
let targetFrameRate = 60; // Target frames per second
let frameInterval = 1000 / targetFrameRate; // Milliseconds per frame
let deltaTime = 0; // Time since last frame
let animationFrameId; // For storing the requestAnimationFrame ID
let customFrameCount = 0; // Custom frame counter for consistent timing
let isPanelVisible = false; // Track panel visibility state - hidden by default
let isTouching = false; // Track if user is currently touching the screen
let lastTouchX = 0; // Last touch X position
let lastTouchY = 0; // Last touch Y position
let isErasing = true; // Track if we're in erasing mode (default: true)

// Spatial partitioning grid for efficient collision detection
let grid = {}; // Object to store lines by cell
const cellSize = 100; // Size of each grid cell

// Audio system setup
let audioContext;
let isSoundEnabled = false; // Flag to enable/disable sound

// Initialize audio context with user interaction
function initAudio() {
    // Create audio context only if it doesn't exist
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Function to play intersection sound
function playIntersectionSound(pitch = 500) {
    if (!isSoundEnabled || !audioContext) return;

    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Create stereo panner for spatial effect
    const panner = audioContext.createStereoPanner();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(audioContext.destination);

    // Set sound properties - use sine wave for smoother sound
    oscillator.type = 'sine';

    // Lower the pitch for a more soothing sound
    // Map the pitch to a lower range (100-300 Hz instead of 300-800)
    const adjustedPitch = map(pitch, 300, 800, 100, 300);
    oscillator.frequency.setValueAtTime(adjustedPitch, audioContext.currentTime);

    // Create spatial movement effect
    // Start from a random position in stereo field
    const startPosition = random(-1, 1);
    panner.pan.setValueAtTime(startPosition, audioContext.currentTime);

    // Move to the opposite side and back
    panner.pan.linearRampToValueAtTime(-startPosition, audioContext.currentTime + 0.4);
    panner.pan.linearRampToValueAtTime(startPosition, audioContext.currentTime + 0.8);

    // Set volume envelope - much softer with longer fade-in and fade-out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.05); // Lower volume, slower attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8); // Longer release

    // Start and stop the sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.8); // Longer duration
}

// Line appearance controls
let lineThickness = 2; // Default thickness
let lineLength = 100; // Default length percentage (100%)

// Color theme settings
let currentTheme = 'random'; // Default theme

// Color theme definitions
const colorThemes = {
    random: {
        getColor: () => {
            return {
                hue: random(360),
                saturation: 80,
                brightness: 90,
            };
        },
    },
    neon: {
        getColor: () => {
            // Neon colors: vivid, bright, high saturation
            const neonHues = [320, 280, 180, 140, 40, 0]; // Magenta, Purple, Cyan, Green, Yellow, Red
            return {
                hue: neonHues[Math.floor(random(neonHues.length))],
                saturation: 100,
                brightness: 95,
            };
        },
    },
    pastel: {
        getColor: () => {
            // Pastel colors: soft, light, medium saturation
            return {
                hue: random(360),
                saturation: 35,
                brightness: 95,
            };
        },
    },
    mono: {
        getColor: () => {
            // Monochrome: variations of brightness with a fixed hue
            // We'll use a base hue of 220 (blue) which works well on black
            return {
                hue: 220,
                saturation: 15,
                brightness: random(70, 100),
            };
        },
    },
};

// Animation settings
const fadeInDuration = 60; // Number of frames for fade-in
const growthDuration = 45; // Number of frames for growth animation
const fadeOutDuration = 30; // Number of frames for fade-out before removal
const lineLifespan = 500; // Maximum lifespan of a line before it starts to fade out

// Reduce line count on mobile for better performance
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    maxLines = 50; // Reduce maximum lines on mobile
    targetFrameRate = 30; // Lower frame rate on mobile
    frameInterval = 1000 / targetFrameRate;
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 1); // Use HSB color mode
    strokeWeight(lineThickness); // Use the thickness variable

    // Set up touch event listeners
    setupTouchEvents();

    // Set up slider event listeners
    document.getElementById('thickness-slider').addEventListener('input', function () {
        lineThickness = parseFloat(this.value);
        document.getElementById('thickness-value').textContent = lineThickness;
    });

    document.getElementById('length-slider').addEventListener('input', function () {
        lineLength = parseInt(this.value);
        document.getElementById('length-value').textContent = lineLength + '%';
    });

    // Add sound toggle button listener
    document.getElementById('sound-toggle').addEventListener('click', function () {
        isSoundEnabled = !isSoundEnabled;
        this.textContent = isSoundEnabled ? '🔊' : '🔇';
        // Initialize audio context on first enable
        if (isSoundEnabled) {
            initAudio();
        }
    });
    // Set initial sound state to off
    document.getElementById('sound-toggle').textContent = '🔇';

    // Initialize audio on first user interaction
    document.addEventListener(
        'click',
        function () {
            initAudio();
        },
        { once: true }
    );

    // Set up theme button event listeners
    setupThemeButtons();

    // Set up panel toggle button
    setupPanelToggle();

    // Initialize spatial grid
    grid = {};

    // Set initial UI layout based on screen size and orientation
    updateUIForScreenSize();

    // Adjust initial settings based on device type and orientation
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;

    // Apply optimal settings for the device
    if (isMobile) {
        maxLines = 50; // Reduce maximum lines on mobile
        targetFrameRate = 30; // Lower frame rate on mobile

        // Further reduce in landscape on small height screens
        if (isLandscape && window.innerHeight < 500) {
            maxLines = 40;
        }
    }

    // Update frame interval based on target frame rate
    frameInterval = 1000 / targetFrameRate;

    // Disable auto looping from p5.js
    noLoop();

    // Start our custom animation loop
    lastFrameTime = performance.now();
    animationLoop();
}

// Set up the theme button event listeners
function setupThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-button');

    themeButtons.forEach((button) => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            themeButtons.forEach((btn) => btn.classList.remove('active'));

            // Add active class to the clicked button
            this.classList.add('active');

            // Get the theme name from the button id
            const themeId = this.id;
            currentTheme = themeId.replace('theme-', '');

            // Optional: change some lines immediately to the new theme
            // This provides faster visual feedback than waiting for new lines
            // applyThemeToExistingLines(currentTheme, 20); // Change 20% of existing lines
        });
    });
}

// Set up the panel toggle button
function setupPanelToggle() {
    const toggleButton = document.getElementById('panel-toggle');
    const controlsPanel = document.getElementById('controls');

    toggleButton.addEventListener('click', function (e) {
        // Toggle the panel visibility
        isPanelVisible = !isPanelVisible;

        // Update the panel class
        if (isPanelVisible) {
            controlsPanel.classList.remove('hidden');
            toggleButton.innerHTML = '≡';
        } else {
            controlsPanel.classList.add('hidden');
            toggleButton.innerHTML = '⚙';
        }

        // Stop event propagation to prevent the document click handler from firing
        e.stopPropagation();
    });

    // Add click event listener to the document to close the panel when clicking outside
    document.addEventListener('click', function (e) {
        // Only proceed if the panel is visible
        if (isPanelVisible) {
            // Check if the click was outside both the panel and the toggle button
            const isOutsidePanel = !controlsPanel.contains(e.target);
            const isOutsideToggle = !toggleButton.contains(e.target);

            // If click was outside both, close the panel
            if (isOutsidePanel && isOutsideToggle) {
                isPanelVisible = false;
                controlsPanel.classList.add('hidden');
                toggleButton.innerHTML = '⚙';
            }
        }
    });

    // Prevent clicks inside the panel from closing it
    controlsPanel.addEventListener('click', function (e) {
        e.stopPropagation();
    });
}

// Function to check if the mouse is over the controls panel
function isMouseOverControls() {
    // First check if panel is even visible
    if (!isPanelVisible) return false;

    const controlsElement = document.getElementById('controls');
    if (controlsElement) {
        const rect = controlsElement.getBoundingClientRect();
        return (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
        );
    }
    return false;
}

// Function to check if mouse is over toggle button
function isMouseOverToggle() {
    const toggleButton = document.getElementById('panel-toggle');
    if (toggleButton) {
        const rect = toggleButton.getBoundingClientRect();
        return (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
        );
    }
    return false;
}

// Custom animation loop using requestAnimationFrame
function animationLoop(currentTime) {
    // Calculate time since last frame
    if (!currentTime) currentTime = performance.now();
    deltaTime = currentTime - lastFrameTime;

    // Only render if enough time has passed for our target frame rate
    if (deltaTime >= frameInterval) {
        // Update our custom frame counter
        customFrameCount++;

        // Update the last frame time, accounting for the actual time passed
        lastFrameTime = currentTime - (deltaTime % frameInterval);

        // Call our draw function
        draw();
    }

    // Request the next frame
    animationFrameId = requestAnimationFrame(animationLoop);
}

// Set up touch event handlers
function setupTouchEvents() {
    // Track multi-touch for pinch/zoom gestures
    let touchStartDistance = 0;
    let lastTapTime = 0;
    let touchTimer = null;

    // Prevent default touch behaviors except on controls
    document.addEventListener(
        'touchstart',
        function (e) {
            if (!isMouseOverControls() && !isMouseOverToggle()) {
                e.preventDefault();

                // Detect double tap (300ms window)
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTapTime;

                if (tapLength < 300 && tapLength > 0) {
                    // Double tap detected - toggle eraser size
                    window.currentRemovalRadius =
                        window.currentRemovalRadius === removalRadius
                            ? removalRadius * 2
                            : removalRadius;

                    // Visual feedback with quick pulse animation
                    const feedbackEl = document.createElement('div');
                    feedbackEl.className = 'touch-feedback';
                    feedbackEl.style.cssText = `
                        position: absolute;
                        left: ${e.touches[0].clientX - 50}px;
                        top: ${e.touches[0].clientY - 50}px;
                        width: ${window.currentRemovalRadius}px;
                        height: ${window.currentRemovalRadius}px;
                        background: rgb(255 255 255 / 20%);
                        border-radius: 50%;
                        pointer-events: none;
                        opacity: 70%;
                        transition: all 0.3s ease;
                        z-index: 1000;
                    `;
                    document.body.appendChild(feedbackEl);

                    // Remove feedback element after animation
                    setTimeout(() => {
                        feedbackEl.style.opacity = '0';
                        setTimeout(() => feedbackEl.remove(), 300);
                    }, 100);
                }

                lastTapTime = currentTime;

                // Handle long press to toggle drawing/erasing mode
                if (touchTimer === null) {
                    touchTimer = setTimeout(() => {
                        isErasing = !isErasing;

                        // Visual feedback for mode toggle
                        const modeText = isErasing ? 'Eraser Mode' : 'View Mode';
                        const feedbackEl = document.createElement('div');
                        feedbackEl.className = 'mode-feedback';
                        feedbackEl.style.cssText = `
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                            padding: 10px 20px;
                            background: rgb(0 0 0 / 70%);
                            color: white;
                            border-radius: 20px;
                            font-family: Arial, sans-serif;
                            pointer-events: none;
                            opacity: 90%;
                            transition: opacity 0.3s ease;
                            z-index: 1000;
                        `;
                        feedbackEl.textContent = modeText;
                        document.body.appendChild(feedbackEl);

                        // Remove feedback after 1.5s
                        setTimeout(() => {
                            feedbackEl.style.opacity = '0';
                            setTimeout(() => feedbackEl.remove(), 300);
                        }, 1500);
                    }, 800); // Long press threshold - 800ms
                }

                // Multi-touch for pinch/zoom handling
                if (e.touches.length === 2) {
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    touchStartDistance = Math.sqrt(dx * dx + dy * dy);
                }
            }
        },
        { passive: false }
    );

    document.addEventListener(
        'touchmove',
        function (e) {
            if (!isMouseOverControls() && !isMouseOverToggle()) {
                e.preventDefault();

                // Handle pinch gesture for eraser size adjustment
                if (e.touches.length === 2) {
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (touchStartDistance > 0) {
                        const scaleFactor = distance / touchStartDistance;
                        const newRadius = removalRadius * scaleFactor;

                        // Limit min/max size
                        window.currentRemovalRadius = Math.min(Math.max(newRadius, 25), 150);
                    }
                }
            }
        },
        { passive: false }
    );

    document.addEventListener('touchend', function () {
        // Clear long press timer
        if (touchTimer !== null) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }

        // Reset distance tracking for pinch
        touchStartDistance = 0;
    });

    // Handle touch events on canvas
    const canvas = document.querySelector('canvas');

    canvas.addEventListener('touchstart', function (e) {
        if (!isMouseOverControls() && !isMouseOverToggle()) {
            isTouching = true;
            // Only activate erasing if in erase mode
            const touch = e.touches[0];
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
            mouseX = touch.clientX;
            mouseY = touch.clientY;
            mouseIsPressed = true;
            mouseButton = LEFT;
        }
    });

    canvas.addEventListener('touchmove', function (e) {
        if (isTouching && !isMouseOverControls() && !isMouseOverToggle()) {
            const touch = e.touches[0];
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
            mouseX = touch.clientX;
            mouseY = touch.clientY;
            mouseIsPressed = true;
            mouseButton = LEFT;
        }
    });

    canvas.addEventListener('touchend', function () {
        isTouching = false;
        mouseIsPressed = false;
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', function () {
        // Delay execution to ensure elements have rerendered
        setTimeout(() => {
            windowResized();

            // Adjust UI based on orientation
            const isLandscape = window.matchMedia('(orientation: landscape)').matches;

            // Potentially adjust settings for different orientations
            if (isLandscape && window.innerHeight < 500) {
                // In landscape on small devices, optimize performance
                if (maxLines > 50) {
                    maxLines = 50;
                }
            } else {
                // Reset to defaults in portrait
                maxLines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                )
                    ? 50
                    : 100;
            }
        }, 300);
    });
}

// Function to update animation states for all lines
function updateLineAnimations() {
    // Check if we need to rebuild the grid
    let needRebuild = false;

    // Filter out lines that have completed their fade-out
    const oldLength = lines.length;
    lines = lines.filter((line) => line.fadeOutFactor > 0);

    // If any lines were removed, we need to rebuild the grid
    if (lines.length !== oldLength) {
        needRebuild = true;
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Update fade-in animation
        if (line.age < fadeInDuration) {
            line.currentAlpha = map(line.age, 0, fadeInDuration, 0, line.targetAlpha);
        } else {
            line.currentAlpha = line.targetAlpha;
        }

        // Update growth animation
        if (line.age < growthDuration) {
            line.growthFactor = map(line.age, 0, growthDuration, 0, 1);
        } else {
            line.growthFactor = 1;
        }

        // Update fade-out animation for old lines
        if (line.age > lineLifespan) {
            let fadeOutAge = line.age - lineLifespan;
            if (fadeOutAge < fadeOutDuration) {
                line.fadeOutFactor = map(fadeOutAge, 0, fadeOutDuration, 1, 0);
            } else {
                line.fadeOutFactor = 0; // Will be filtered out on next update
            }
        }

        // Increment age
        line.age++;
    }

    // Rebuild the grid if needed
    if (needRebuild) {
        rebuildGrid();
    }
}

// Function to draw an eraser shape
function drawEraser(x, y, radius) {
    push(); // Isolate drawing style changes
    translate(x, y); // Move to mouse position
    rectMode(CENTER); // Draw rectangles from their center

    // Gum eraser colors - slightly off-white with a hint of blue-gray
    const eraserColor = color(210, 10, 95); // Light blue-gray in HSB
    const edgeColor = color(210, 15, 85); // Slightly darker edge
    const shadowColor = color(210, 15, 80, 0.3); // Subtle shadow

    // Main eraser body - rectangular with slightly rounded corners
    // Gum erasers are typically more rectangular than regular erasers
    noStroke();
    fill(eraserColor);

    // Draw the main body with rounded corners
    rect(0, 0, radius * 1.5, radius * 0.8, 6);

    // Add a subtle shadow on the top edge for depth
    fill(shadowColor);
    rect(-radius * 0.4, -radius * 0.3, radius * 0.8, radius * 0.2, 3);

    // Add the characteristic "gum" texture - small dots and lines
    fill(210, 5, 90, 0.1); // Slightly lighter dots
    for (let i = 0; i < 12; i++) {
        let dotX = random(-radius * 0.6, radius * 0.6);
        let dotY = random(-radius * 0.3, radius * 0.3);
        let dotSize = random(1, 3);
        ellipse(dotX, dotY, dotSize, dotSize);
    }

    // Add some small lines to simulate the texture of a gum eraser
    stroke(210, 5, 90, 0.15);
    strokeWeight(0.8);
    for (let i = 0; i < 5; i++) {
        let lineX1 = random(-radius * 0.6, radius * 0.6);
        let lineY1 = random(-radius * 0.3, radius * 0.3);
        let lineX2 = lineX1 + random(-5, 5);
        let lineY2 = lineY1 + random(-3, 3);
        line(lineX1, lineY1, lineX2, lineY2);
    }

    // Add a subtle edge highlight
    noFill();
    stroke(edgeColor);
    strokeWeight(1);
    rect(0, 0, radius * 1.5, radius * 0.8, 6);

    // Add a small "brand" mark or texture pattern
    noStroke();
    fill(210, 5, 90, 0.2);
    rect(-radius * 0.3, -radius * 0.2, radius * 0.6, radius * 0.1, 2);

    pop(); // Restore original drawing styles
}

// Function to manage adding/removing lines
function manageLines() {
    // Add a new line at the specified speed
    if (customFrameCount % Math.floor(1 / drawSpeed) === 0) {
        // Generate random center point
        let centerX = random(width);
        let centerY = random(height);

        // Calculate line length based on screen size and user's setting
        let maxPossibleLength = min(width, height) * 0.6; // 60% of the smaller dimension
        let actualLength = maxPossibleLength * (lineLength / 100);

        // Random angle for the line
        let angle = random(TWO_PI);

        // Calculate start and end points based on center, length and angle
        let halfLength = actualLength / 2;
        let startX = centerX + cos(angle) * halfLength;
        let startY = centerY + sin(angle) * halfLength;
        let endX = centerX - cos(angle) * halfLength;
        let endY = centerY - sin(angle) * halfLength;

        // Get color properties based on selected theme
        const colorProps = colorThemes[currentTheme].getColor();

        let targetAlpha = 0.8; // Target alpha when fully faded in

        // Create an object to store the line's data
        let newLine = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            thickness: lineThickness, // Store thickness with the line
            hue: colorProps.hue,
            saturation: colorProps.saturation,
            brightness: colorProps.brightness,
            targetAlpha: targetAlpha,
            currentAlpha: 0, // Start fully transparent
            age: 0, // Track frames since creation for animation
            growthFactor: 0, // Start with no length
            fadeOutFactor: 1, // Will be used for fade-out animation
        };

        // Add the new line to the end of the array
        lines.push(newLine);

        // If we have more lines than the maximum allowed,
        // remove the oldest one (from the beginning of the array).
        if (lines.length > maxLines) {
            // Remove the line from the grid as well
            lines.shift(); // shift() removes the first element
            // Since indices change when we remove a line, rebuild the grid
            rebuildGrid();
        }
    }
}

// Helper function to calculate the squared distance between two points
function distSq(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return dx * dx + dy * dy;
}

// Helper function to calculate the shortest distance between a point and a line segment
function pointSegmentDistance(px, py, x1, y1, x2, y2) {
    let l2 = distSq(x1, y1, x2, y2);
    if (l2 === 0) return dist(px, py, x1, y1); // Handle case where segment is a point

    // Calculate the projection parameter t
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    // Clamp t to the range [0, 1] to stay within the segment
    t = Math.max(0, Math.min(1, t));

    // Calculate the closest point on the segment
    let closestX = x1 + t * (x2 - x1);
    let closestY = y1 + t * (y2 - y1);

    // Return the distance from the point to the closest point on the segment
    return dist(px, py, closestX, closestY);
}

// Function to draw all stored lines
function drawLines() {
    // Draw all stored lines
    for (let i = 0; i < lines.length; i++) {
        let lineData = lines[i];

        // Set the stroke weight for this specific line
        strokeWeight(lineData.thickness);

        // Set the color for this specific line, using the current (animated) alpha
        stroke(
            lineData.hue,
            lineData.saturation,
            lineData.brightness,
            lineData.currentAlpha * lineData.fadeOutFactor
        );

        // Calculate the current line endpoints based on growth animation
        let currentStartX, currentStartY, currentEndX, currentEndY;

        if (lineData.growthFactor < 1) {
            // Calculate midpoint
            let midX = (lineData.startX + lineData.endX) / 2;
            let midY = (lineData.startY + lineData.endY) / 2;

            // Grow from middle outward
            currentStartX = lerp(midX, lineData.startX, lineData.growthFactor);
            currentStartY = lerp(midY, lineData.startY, lineData.growthFactor);
            currentEndX = lerp(midX, lineData.endX, lineData.growthFactor);
            currentEndY = lerp(midY, lineData.endY, lineData.growthFactor);
        } else {
            // Use the full line dimensions
            currentStartX = lineData.startX;
            currentStartY = lineData.startY;
            currentEndX = lineData.endX;
            currentEndY = lineData.endY;
        }

        // Draw the line using the current (animated) endpoints
        line(currentStartX, currentStartY, currentEndX, currentEndY);
    }
}

// Function to remove lines near the mouse cursor with default radius
function removeLinesNearMouse() {
    // Use the more flexible function with the default radius
    removeLinesNearMouseWithRadius(removalRadius);
}

// Function to check if two line segments intersect
function checkLineIntersection(line1, line2) {
    // Calculate current endpoints for line1 based on its growth
    let mid1X = (line1.startX + line1.endX) / 2;
    let mid1Y = (line1.startY + line1.endY) / 2;
    let start1X = lerp(mid1X, line1.startX, line1.growthFactor);
    let start1Y = lerp(mid1Y, line1.startY, line1.growthFactor);
    let end1X = lerp(mid1X, line1.endX, line1.growthFactor);
    let end1Y = lerp(mid1Y, line1.endY, line1.growthFactor);

    // Calculate current endpoints for line2 based on its growth
    let mid2X = (line2.startX + line2.endX) / 2;
    let mid2Y = (line2.startY + line2.endY) / 2;
    let start2X = lerp(mid2X, line2.startX, line2.growthFactor);
    let start2Y = lerp(mid2Y, line2.startY, line2.growthFactor);
    let end2X = lerp(mid2X, line2.endX, line2.growthFactor);
    let end2Y = lerp(mid2Y, line2.endY, line2.growthFactor);

    // Calculate intersection
    let denominator = (end2Y - start2Y) * (end1X - start1X) - (end2X - start2X) * (end1Y - start1Y);

    if (denominator === 0) return false;

    let ua =
        ((end2X - start2X) * (start1Y - start2Y) - (end2Y - start2Y) * (start1X - start2X)) /
        denominator;
    let ub =
        ((end1X - start1X) * (start1Y - start2Y) - (end1Y - start1Y) * (start1X - start2X)) /
        denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// Function to get cell key from position
function getCellKey(x, y) {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    return `${cellX},${cellY}`;
}

// Function to get all cells that a line intersects
function getLineCells(line) {
    const cells = new Set();

    // Get cells for start and end points
    cells.add(getCellKey(line.startX, line.startY));
    cells.add(getCellKey(line.endX, line.endY));

    // Add cells along the line using Bresenham's line algorithm
    const steps = 10; // Number of sample points along the line
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const x = line.startX + t * (line.endX - line.startX);
        const y = line.startY + t * (line.endY - line.startY);
        cells.add(getCellKey(x, y));
    }

    return [...cells];
}

// Function to add a line to the spatial grid
function addLineToGrid(line, index) {
    const cells = getLineCells(line);

    for (const cell of cells) {
        if (!grid[cell]) {
            grid[cell] = [];
        }
        if (!grid[cell].includes(index)) {
            grid[cell].push(index);
        }
    }
}

// Function to rebuild the entire spatial grid
function rebuildGrid() {
    grid = {};
    for (let i = 0; i < lines.length; i++) {
        addLineToGrid(lines[i], i);
    }
}

// Function to check all lines for intersections
function checkAllIntersections() {
    // Only check the most recently added line against others
    if (lines.length < 2) return;

    let newLine = lines[lines.length - 1];
    const newLineIndex = lines.length - 1;

    // Only check during growth animation
    if (newLine.growthFactor < 1) {
        // Add the new line to the grid
        addLineToGrid(newLine, newLineIndex);

        // Get cells that the new line intersects
        const cells = getLineCells(newLine);
        const checkedLines = new Set();

        // Check only against lines in the same cells
        for (const cell of cells) {
            if (!grid[cell]) continue;

            for (const lineIndex of grid[cell]) {
                // Skip the new line itself and already checked lines
                if (lineIndex === newLineIndex || checkedLines.has(lineIndex)) continue;
                checkedLines.add(lineIndex);

                const otherLine = lines[lineIndex];

                // Skip lines that are fading out
                if (otherLine.fadeOutFactor < 1) continue;

                // Check for intersection
                if (checkLineIntersection(newLine, otherLine)) {
                    // Calculate pitch based on line properties
                    let pitch = map(newLine.hue, 0, 360, 300, 800);

                    // Play intersection sound
                    playIntersectionSound(pitch);

                    // We can break after finding first intersection to prevent sound overlap
                    return;
                }
            }
        }
    }
}

// Update the draw function to handle touch input with variable eraser size
function draw() {
    background(0, 0, 0, 1);
    manageLines();
    updateLineAnimations();
    checkAllIntersections();

    // Get the current eraser radius - might be modified by pinch gestures
    const localRemovalRadius = window.currentRemovalRadius || removalRadius;

    // Use touch position for erasing if available
    if (isTouching && isErasing) {
        mouseX = lastTouchX;
        mouseY = lastTouchY;

        // Pass the current eraser radius to the removal function
        removeLinesNearMouseWithRadius(localRemovalRadius);
        drawEraser(mouseX, mouseY, localRemovalRadius);
    } else if (
        mouseIsPressed &&
        mouseButton === LEFT &&
        !isMouseOverControls() &&
        !isMouseOverToggle()
    ) {
        removeLinesNearMouseWithRadius(localRemovalRadius);
        drawEraser(mouseX, mouseY, localRemovalRadius);
    }

    drawLines();
}

// Modified function to use variable radius for removal
function removeLinesNearMouseWithRadius(radius) {
    // Only remove lines if the left mouse button is pressed
    // And the mouse is NOT over the controls panel or toggle button
    if (mouseIsPressed && mouseButton === LEFT && !isMouseOverControls() && !isMouseOverToggle()) {
        // Get potential cells that could contain lines near the mouse
        const cellRadius = radius + cellSize; // Add cellSize to ensure we check all potential cells
        const checkedLines = new Set();

        // Check cells within a square area around the mouse
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const x = mouseX + dx * cellRadius;
                const y = mouseY + dy * cellRadius;
                const cell = getCellKey(x, y);

                if (grid[cell]) {
                    // Check each line in this cell
                    for (const lineIndex of grid[cell]) {
                        // Skip already checked lines
                        if (checkedLines.has(lineIndex)) continue;
                        checkedLines.add(lineIndex);

                        let lineData = lines[lineIndex];

                        // Skip lines already fading out
                        if (lineData.fadeOutFactor < 1) continue;

                        // Calculate the shortest distance from the mouse cursor to the line segment
                        let distanceToSegment = pointSegmentDistance(
                            mouseX,
                            mouseY,
                            lineData.startX,
                            lineData.startY,
                            lineData.endX,
                            lineData.endY
                        );

                        // If line is within removal radius, trigger immediate fade-out
                        if (distanceToSegment <= radius) {
                            // Start fadeout if not already fading
                            lineData.age = lineLifespan + 1; // Start fade-out
                        }
                    }
                }
            }
        }
    }
}

// Update windowResized to handle orientation changes and screen size adjustments
function windowResized() {
    // Resize the canvas
    resizeCanvas(windowWidth, windowHeight);

    // Adjust line lengths based on new screen dimensions
    const maxPossibleLength = min(width, height) * 0.6;
    const actualLength = maxPossibleLength * (lineLength / 100);

    // Dynamically adjust existing lines to fit new screen dimensions
    lines.forEach((line) => {
        // Calculate the current line center
        const centerX = (line.startX + line.endX) / 2;
        const centerY = (line.startY + line.endY) / 2;

        // Check if center is outside canvas boundaries and adjust if needed
        const newCenterX = centerX < 0 ? width * 0.25 : centerX > width ? width * 0.75 : centerX;
        const newCenterY = centerY < 0 ? height * 0.25 : centerY > height ? height * 0.75 : centerY;

        // Calculate the line's current angle
        const angle = Math.atan2(line.endY - line.startY, line.endX - line.startX);

        // Calculate new start/end points maintaining the angle but adjusting length
        const halfLength = actualLength / 2;
        line.startX = newCenterX + Math.cos(angle) * halfLength;
        line.startY = newCenterY + Math.sin(angle) * halfLength;
        line.endX = newCenterX - Math.cos(angle) * halfLength;
        line.endY = newCenterY - Math.sin(angle) * halfLength;
    });

    // Check for orientation
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;

    // Apply different settings based on orientation
    if (isLandscape) {
        // In landscape mode, we might want to reduce density for low-height screens
        if (window.innerHeight < 500) {
            maxLines = Math.min(maxLines, 50);
            targetFrameRate = 30;
            frameInterval = 1000 / targetFrameRate;
        }
    } else {
        // Portrait mode might handle differently based on device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

        if (isMobile) {
            // Mobile portrait settings
            maxLines = 50;
            targetFrameRate = 30;
        } else {
            // Desktop/tablet portrait settings
            maxLines = 100;
            targetFrameRate = 60;
        }
        frameInterval = 1000 / targetFrameRate;
    }

    // Rebuild the spatial grid to account for new positions
    rebuildGrid();

    // Update UI settings if needed
    updateUIForScreenSize();
}

// Helper function to update UI based on screen size
function updateUIForScreenSize() {
    const controlsPanel = document.getElementById('controls');
    const toggleButton = document.getElementById('panel-toggle');

    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
    // Check for small screen (phone-sized)
    const isSmallScreen = window.innerWidth < 480;
    // Check for tablet-sized screen
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
    // Check orientation
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;

    // Apply specific adjustments for different screen configurations
    if (isMobile && isSmallScreen) {
        if (isLandscape) {
            // Small mobile in landscape
            // Position controls on the right side
            controlsPanel.style.top = '20px';
            controlsPanel.style.bottom = 'auto';
            controlsPanel.style.right = '20px';
            controlsPanel.style.transform = 'none';

            // Position toggle button
            toggleButton.style.top = '20px';
            toggleButton.style.bottom = 'auto';
            toggleButton.style.right = '20px';
        } else {
            // Small mobile in portrait
            // Position controls at bottom center
            controlsPanel.style.top = 'auto';
            controlsPanel.style.bottom = '20px';
            controlsPanel.style.right = '50%';
            controlsPanel.style.transform = 'translateX(50%)';

            // Position toggle button
            toggleButton.style.top = 'auto';
            toggleButton.style.bottom = '20px';
            toggleButton.style.right = '20px';
        }
    } else if (isTablet) {
        // Tablet - controls in top right or side based on orientation
        if (isLandscape) {
            controlsPanel.style.top = '20px';
            controlsPanel.style.right = '20px';
            controlsPanel.style.width = '320px';
        } else {
            controlsPanel.style.top = '20px';
            controlsPanel.style.right = '20px';
            controlsPanel.style.width = '300px';
        }
    }
}

// Function to clean up when the page is closed or refreshed
window.addEventListener('beforeunload', () => {
    // Cancel the animation frame to prevent memory leaks
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
// Export functions for testing (if in Node.js environment for tests)
/* eslint-disable no-undef */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        distSq,
        pointSegmentDistance,
        // Add other functions you want to test here
        // checkLineIntersection // Example: if you refactor it to be testable
    };
}
/* eslint-enable no-undef */
