/* eslint-env browser */
/* global setup, draw, windowResized, keyPressed, createCanvas, background, fill, noStroke, circle, text, textSize, key, keyIsPressed, width, height, random, constrain, lerp, dist, cos, sin, TWO_PI, rect, navigator, line, stroke, strokeWeight, map, noFill */

// Main application for ISS Radio
// Global variables
const particles = [];

// Mobile detection function
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (typeof window.orientation !== 'undefined') ||
         window.innerWidth <= 768;
}

// Adjust particle count based on device type
const numParticles = isMobileDevice() ? 75 : 150;
const continentPoints = [];
let particleGeoData = []; // Store original geographic data for particles
let radioManager;
let geographyManager;
let showContinentOutlines = false; // Toggle for continent outline visualization

function setup() {
  // iOS Safari viewport height fix
  const setVh = () => {
    const visualHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${visualHeight * 0.01}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);

  createCanvas(windowWidth, windowHeight);

  // Initialize managers
  radioManager = new RadioManager();
  geographyManager = new GeographyManager();

  // Make managers globally accessible immediately
  window.geographyManager = geographyManager;
  window.radioManager = radioManager;

  // Initialize radio UI
  radioManager.init();

  // Set up fullscreen event listeners for canvas resizing
  document.addEventListener('fullscreenchange', () => {
    // Recompute vh then resize canvas
    setVh();
    resizeCanvas(windowWidth, windowHeight);
    geographyManager.repositionParticlesAfterResize();
  });
  document.addEventListener('webkitfullscreenchange', () => {
    setVh();
    resizeCanvas(windowWidth, windowHeight);
    geographyManager.repositionParticlesAfterResize();
  });

  // Generate continent outline points
  geographyManager.generateContinentPoints();
  console.log(`Generated ${window.continentPoints.length} continent points`);

  // Create regular particles positioned on continents
  particleGeoData = []; // Reset geographic data array
  window.particleGeoData = particleGeoData; // Make it global immediately
  window.particles = particles; // Make particles global immediately

  if (window.continentPoints.length === 0) {
    console.error('No continent points generated! Creating fallback particles...');
    // Fallback: create particles at random positions
    for (let i = 0; i < numParticles; i++) {
      const x = random(width);
      const y = random(height);
      particles.push(new Particle(x, y, false));
      const geoCoords = geographyManager.xyToLatLon(x, y);
      particleGeoData.push(geoCoords);
    }
  } else {
    // Distribute particles equally across continents
    const continentNames = Object.keys(window.continentGroups);
    const particlesPerContinent = Math.floor(numParticles / continentNames.length);
    const remainder = numParticles % continentNames.length;

    console.log(`Distributing ${numParticles} particles across ${continentNames.length} continents:`);
    console.log(`${particlesPerContinent} particles per continent, ${remainder} extra particles`);

    let totalCreated = 0;
    continentNames.forEach((continentName, index) => {
      const continentPoints = window.continentGroups[continentName];
      let particlesToCreate = particlesPerContinent;

      // Add extra particles to first few continents to handle remainder
      if (index < remainder) {
        particlesToCreate += 1;
      }

      if (continentPoints.length === 0) {
        console.warn(`No points available for ${continentName}, skipping...`);
        return;
      }

      console.log(`Creating ${particlesToCreate} particles for ${continentName} (${continentPoints.length} points available)`);

      for (let i = 0; i < particlesToCreate; i++) {
        const point = random(continentPoints);
        particles.push(new Particle(point.x, point.y, false));

        // Store geographic coordinates for this particle
        const geoCoords = geographyManager.xyToLatLon(point.x, point.y);
        particleGeoData.push(geoCoords);
        totalCreated++;
      }
    });

    console.log(`Total particles created: ${totalCreated}`);
  }

  console.log(`Created ${particleGeoData.length} particles with geographic data`);

  // Create ISS particle
  const iss = new Particle(width / 2, height / 2, true);
  particles.push(iss);

  // Initialize ISS geographic data
  geographyManager.issGeoData = geographyManager.xyToLatLon(width / 2, height / 2);

  // Start ISS tracking
  geographyManager.initTracking(radioManager);
}

// Enhanced resize handling with debouncing - repositions all particles properly
let resizeTimeout;
function windowResized() {
  console.log(`Window resized to: ${windowWidth}x${windowHeight}`);
  resizeCanvas(windowWidth, windowHeight);

  // Debounce the repositioning to avoid excessive calls during resize
  window.clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    console.log('Debounce timeout reached, repositioning particles...');
    // Try both local and global references
    const manager = window.geographyManager || geographyManager;
    if (manager) {
      manager.repositionParticlesAfterResize();
    } else {
      console.error('GeographyManager not available for resize - neither global nor local reference found');
    }
  }, 150);
}

// Keyboard shortcuts
function keyPressed() {
  if (key === 'f' || key === 'F') {
    radioManager.toggleFullscreen();
  }
  if (key === 'm' || key === 'M') {
    showContinentOutlines = !showContinentOutlines;
    console.log('Continent outlines:', showContinentOutlines ? 'ON' : 'OFF');
  }
  // Toggle play/pause on 'p' or 'P'
  if (key === 'p' || key === 'P') {
    if (radioManager && typeof radioManager.togglePlayback === 'function') {
      radioManager.togglePlayback();
    }
  }
  // Toggle ISS context overlay on 'i' or 'I'
  if (key === 'i' || key === 'I') {
    if (radioManager && typeof radioManager.toggleIssContext === 'function') {
      radioManager.toggleIssContext();
    }
  }
  // Toggle orbital path preview on 'o' or 'O'
  if (key === 'o' || key === 'O') {
    if (geographyManager && typeof geographyManager.toggleOrbitalPath === 'function') {
      geographyManager.toggleOrbitalPath();
    }
  }
}

function draw() {
  background(0);

  // Draw continent outline points as tiny dots (press 'm' to toggle)
  if (showContinentOutlines && window.continentPoints) {
    fill(100, 100, 200, 150); // Light blue color with transparency
    noStroke();
    for (const point of window.continentPoints) {
      circle(point.x, point.y, 4); // Draw small circles for continent points
    }

    // Debug info with improved layout
    const debugInfoX = 10;
    const debugLines = window.continentGroups ? Object.keys(window.continentGroups).length + 7 : 6;
    const lineHeight = 18;
    const padding = 12;
    const panelHeight = debugLines * lineHeight + padding * 2;
    const debugInfoY = height - panelHeight;
    const panelWidth = 320;

    // Create semi-transparent background for debug panel
    fill(0, 0, 0, 180);
    noStroke();

    // Draw background panel
    rect(debugInfoX - 5, debugInfoY - 5, panelWidth, panelHeight, 5);

    // Debug text with better spacing and organization
    fill(255, 255, 255);
    textSize(14);
    let currentY = debugInfoY + padding;

    // Header section
    fill(100, 200, 255);
    text('DEBUG MODE - Continent Visualization', debugInfoX, currentY);
    currentY += lineHeight + 4;

    // Statistics section
    fill(255, 255, 255);
    text(`Total continent points: ${window.continentPoints.length}`, debugInfoX, currentY);
    currentY += lineHeight;
    text(`Total particles: ${particles.length}`, debugInfoX, currentY);
    currentY += lineHeight + 4;

    // Continent distribution with improved formatting
    if (window.continentGroups) {
      fill(150, 255, 150);
      text('Continent Distribution:', debugInfoX, currentY);
      currentY += lineHeight;

      fill(255, 255, 255);
      Object.keys(window.continentGroups).forEach(continent => {
        const count = window.continentGroups[continent].length;
        const formattedName = continent.charAt(0).toUpperCase() + continent.slice(1);
        text(`  ${formattedName}: ${count} points`, debugInfoX + 10, currentY);
        currentY += lineHeight;
      });
      currentY += 4;
    }

    // Controls section
    fill(255, 200, 100);
    text('Press M to toggle outlines', debugInfoX, currentY);
    currentY += lineHeight;
    text('Press O to toggle orbital path', debugInfoX, currentY);
    currentY += lineHeight;

    // Orbital path status
    if (geographyManager && geographyManager.showOrbitalPath) {
      fill(100, 255, 100);
      text(`Orbital path: ON (${geographyManager.orbitalPath.length} points)`, debugInfoX, currentY);
    } else {
      fill(150, 150, 150);
      text('Orbital path: OFF', debugInfoX, currentY);
    }
  }

  // Draw ISS orbital path preview
  if (geographyManager && geographyManager.showOrbitalPath && geographyManager.orbitalPath.length > 0) {
    drawOrbitalPath();
  }

  // Handle collisions
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      particles[i].collides(particles[j]);
    }
  }

  // Update and show particles
  for (const particle of particles) {
    particle.update();
    particle.show();
  }

}

// Draw ISS orbital path preview with color-coded regional segments
function drawOrbitalPath() {
  const path = geographyManager.orbitalPath;
  if (path.length < 2) {return;}

  // Define colors for different regions
  const regionColors = {
    'Ocean': [100, 150, 200],           // Blue
    'North America': [255, 200, 100],   // Orange
    'South America': [150, 255, 150],   // Light green
    'Europe': [200, 100, 255],          // Purple
    'Africa': [255, 150, 100],          // Coral
    'Asia': [255, 255, 100],            // Yellow
    'Oceania': [100, 255, 200],         // Cyan
    'US West': [255, 150, 50],          // Orange-red
    'US East': [255, 200, 50],          // Gold
    'Canada': [200, 255, 100],          // Light green
    'Mexico/Central America': [255, 180, 80],  // Orange
    'Brazil': [150, 255, 100],          // Bright green
    'Argentina/Chile': [180, 255, 120], // Pale green
    'Western Europe': [180, 100, 255],  // Light purple
    'Northern Europe': [150, 120, 255], // Blue-purple
    'Eastern Europe': [220, 120, 255],  // Pink-purple
    'Mediterranean': [200, 150, 255],   // Lavender
    'East Asia': [255, 255, 150],       // Light yellow
    'Southeast Asia': [255, 200, 150],  // Peach
    'South Asia': [200, 255, 200],      // Mint
    'Middle East': [255, 220, 150],     // Beige
    'North Africa': [255, 180, 120],    // Sandy
    'Sub-Saharan Africa': [255, 120, 80], // Reddish
    'Australia': [120, 255, 200],       // Aqua
    'Pacific Islands': [100, 200, 255], // Sky blue
    'Arctic': [200, 200, 255],          // Ice blue
  };

  // Draw dotted path segments with color coding
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    // Get color for this segment's region
    const regionColor = regionColors[current.region] || [150, 150, 150]; // Default gray

    // Calculate segment opacity based on time (fade out over time)
    const maxTime = path[path.length - 1].timeOffset;
    const opacity = map(current.timeOffset, 0, maxTime, 180, 60);

    // Set stroke color with opacity
    stroke(regionColor[0], regionColor[1], regionColor[2], opacity);
    strokeWeight(2);

    // Draw dotted line by drawing small segments
    const segmentCount = 8;
    const dx = (next.x - current.x) / segmentCount;
    const dy = (next.y - current.y) / segmentCount;

    for (let j = 0; j < segmentCount; j += 2) {
      const x1 = current.x + dx * j;
      const y1 = current.y + dy * j;
      const x2 = current.x + dx * (j + 1);
      const y2 = current.y + dy * (j + 1);

      // Handle horizontal wrapping for ISS path
      const drawX1 = x1, drawX2 = x2;
      if (Math.abs(x2 - x1) > width / 2) {
        // Path crosses screen edge, don't draw this segment
        continue;
      }

      line(drawX1, y1, drawX2, y2);
    }
  }

  // Draw time markers every 15 minutes
  fill(255, 255, 255, 120);
  noStroke();
  textSize(10);

  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    if (point.timeOffset % 15 === 0 && point.timeOffset > 0) {
      // Draw small circle at time marker
      fill(255, 255, 255, 150);
      circle(point.x, point.y, 6);

      // Draw time label
      fill(255, 255, 255, 200);
      text(`+${point.timeOffset}m`, point.x + 8, point.y - 8);
    }
  }
}

// Make variables global for module access
window.particles = particles;
window.continentPoints = continentPoints;
window.particleGeoData = particleGeoData;
window.geographyManager = geographyManager;
window.radioManager = radioManager;