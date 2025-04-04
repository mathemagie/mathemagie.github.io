     // Define the maximum number of lines we want on the screen
     const maxLines = 100; // Renamed from maxDots
     let drawSpeed = 0.2; // Control the speed of adding new lines
     let lines = []; // Array to store line data (Renamed from dots)
     const removalRadius = 50; // Radius around the mouse to remove lines
     let lastFrameTime = 0; // For tracking time between frames
     let targetFrameRate = 60; // Target frames per second
     let frameInterval = 1000 / targetFrameRate; // Milliseconds per frame
     let deltaTime = 0; // Time since last frame
     let animationFrameId; // For storing the requestAnimationFrame ID
     let customFrameCount = 0; // Custom frame counter for consistent timing
     let isPanelVisible = false; // Track panel visibility state - hidden by default
     
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
                     brightness: 90
                 };
             }
         },
         neon: {
             getColor: () => {
                 // Neon colors: vivid, bright, high saturation
                 const neonHues = [320, 280, 180, 140, 40, 0]; // Magenta, Purple, Cyan, Green, Yellow, Red
                 return {
                     hue: neonHues[Math.floor(random(neonHues.length))],
                     saturation: 100,
                     brightness: 95
                 };
             }
         },
         pastel: {
             getColor: () => {
                 // Pastel colors: soft, light, medium saturation
                 return {
                     hue: random(360),
                     saturation: 35,
                     brightness: 95
                 };
             }
         },
         mono: {
             getColor: () => {
                 // Monochrome: variations of brightness with a fixed hue
                 // We'll use a base hue of 220 (blue) which works well on black
                 return {
                     hue: 220,
                     saturation: 15,
                     brightness: random(70, 100)
                 };
             }
         }
     };
     
     // Animation settings
     const fadeInDuration = 60; // Number of frames for fade-in
     const growthDuration = 45; // Number of frames for growth animation
     const fadeOutDuration = 30; // Number of frames for fade-out before removal
     const lineLifespan = 500; // Maximum lifespan of a line before it starts to fade out

     function setup() {
         createCanvas(windowWidth, windowHeight);
         colorMode(HSB, 360, 100, 100, 1); // Use HSB color mode
         strokeWeight(lineThickness); // Use the thickness variable
         
         // Set up slider event listeners
         document.getElementById('thickness-slider').addEventListener('input', function() {
             lineThickness = parseFloat(this.value);
             document.getElementById('thickness-value').textContent = lineThickness;
         });
         
         document.getElementById('length-slider').addEventListener('input', function() {
             lineLength = parseInt(this.value);
             document.getElementById('length-value').textContent = lineLength + '%';
         });
         
         // Set up theme button event listeners
         setupThemeButtons();
         
         // Set up panel toggle button
         setupPanelToggle();
         
         // Disable auto looping from p5.js
         noLoop();
         
         // Start our custom animation loop
         lastFrameTime = performance.now();
         animationLoop();
     }
     
     // Set up the theme button event listeners
     function setupThemeButtons() {
         const themeButtons = document.querySelectorAll('.theme-button');
         
         themeButtons.forEach(button => {
             button.addEventListener('click', function() {
                 // Remove active class from all buttons
                 themeButtons.forEach(btn => btn.classList.remove('active'));
                 
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
         
         toggleButton.addEventListener('click', function() {
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

     function draw() {
         background(0, 0, 0, 1); // Solid black background
         manageLines(); // Renamed from manageDots
         updateLineAnimations(); // Update animation states for all lines
         removeLinesNearMouse(); // Add this call
         drawLines();   // Renamed from drawDots

         // Draw the eraser (gomme) if left mouse is pressed
         // But only if the mouse is NOT over the controls panel or toggle button
         if (mouseIsPressed && mouseButton === LEFT && !isMouseOverControls() && !isMouseOverToggle()) {
             drawEraser(mouseX, mouseY, removalRadius);
         }
     }
     
     // Function to update animation states for all lines
     function updateLineAnimations() {
         // Filter out lines that have completed their fade-out
         lines = lines.filter(line => line.fadeOutFactor > 0);
         
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
     }

     // Function to draw an eraser shape
     function drawEraser(x, y, radius) {
         push(); // Isolate drawing style changes
         translate(x, y); // Move to mouse position
         rectMode(CENTER); // Draw rectangles from their center
         
         // Simple white eraser with slightly off-white color to match photo
         fill(55, 5, 98); // Slightly off-white/cream color in HSB
         stroke(40, 10, 85); // Light tan/beige edge color
         strokeWeight(1.5);
         
         // Main eraser body - shorter and more rectangular like in the photo
         // Rectangular shape with rounded corners
         rect(0, 0, radius * 1.2, radius * 0.7, 8); // More rectangular with rounded corners
         
         // Add subtle shading to give depth
         noStroke();
         fill(55, 10, 90, 0.15); // Slightly darker shade for top shadow
         rect(-radius * 0.2, -radius * 0.15, radius * 0.7, radius * 0.3, 3);
         
         // Add a few small dots/marks to simulate the texture/wear of the eraser
         fill(0, 0, 70, 0.05); // Very subtle dark marks
         for (let i = 0; i < 8; i++) {
             let dotX = random(-radius * 0.5, radius * 0.5);
             let dotY = random(-radius * 0.3, radius * 0.3);
             let dotSize = random(1, 3);
             ellipse(dotX, dotY, dotSize, dotSize);
         }
         
         pop(); // Restore original drawing styles
     }

     // Function to manage adding/removing lines
     function manageLines() {
         // Add a new line at the specified speed
         if (customFrameCount % Math.floor(1/drawSpeed) === 0) {
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
                 fadeOutFactor: 1 // Will be used for fade-out animation
             };

             // Add the new line to the end of the array
             lines.push(newLine);

             // If we have more lines than the maximum allowed,
             // remove the oldest one (from the beginning of the array).
             if (lines.length > maxLines) {
                 lines.shift(); // shift() removes the first element
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
             stroke(lineData.hue, lineData.saturation, lineData.brightness, lineData.currentAlpha * lineData.fadeOutFactor);
             
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

     // Function to remove lines near the mouse cursor
     function removeLinesNearMouse() {
         // Only remove lines if the left mouse button is pressed
         // And the mouse is NOT over the controls panel or toggle button
         if (mouseIsPressed && mouseButton === LEFT && !isMouseOverControls() && !isMouseOverToggle()) {
             for (let i = 0; i < lines.length; i++) {
                 let lineData = lines[i];
                 
                 // Calculate the shortest distance from the mouse cursor to the line segment
                 let distanceToSegment = pointSegmentDistance(
                     mouseX, mouseY,
                     lineData.startX, lineData.startY,
                     lineData.endX, lineData.endY
                 );
                 
                 // If line is within removal radius, trigger immediate fade-out
                 if (distanceToSegment <= removalRadius) {
                     // Start fadeout if not already fading
                     if (lineData.fadeOutFactor === 1) {
                         lineData.age = lineLifespan + 1; // Start fade-out
                     }
                 }
             }
         }
     }

     function windowResized() {
         resizeCanvas(windowWidth, windowHeight);
         // We don't need to call loop() since we're using our own animation loop
     }
     
     // Function to clean up when the page is closed or refreshed
     window.addEventListener('beforeunload', () => {
         // Cancel the animation frame to prevent memory leaks
         if (animationFrameId) {
             cancelAnimationFrame(animationFrameId);
         }
     });