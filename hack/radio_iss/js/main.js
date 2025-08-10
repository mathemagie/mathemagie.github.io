/* eslint-env browser */
/* global setup, draw, windowResized, keyPressed, createCanvas, background, fill, noStroke, circle, text, textSize, key, keyIsPressed, width, height, random, constrain, lerp, dist, cos, sin, TWO_PI */

// Main application for ISS Radio
// Global variables
const particles = [];
const numParticles = 150;
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

    // Debug info
    fill(255);
    textSize(14);
    text(`Total continent points: ${window.continentPoints.length}`, 10, height - 100);
    text(`Total particles: ${particles.length}`, 10, height - 80);

    // Show continent distribution
    if (window.continentGroups) {
      let yOffset = height - 60;
      Object.keys(window.continentGroups).forEach(continent => {
        const count = window.continentGroups[continent].length;
        text(`${continent}: ${count} points`, 10, yOffset);
        yOffset += 16;
      });
    }

    text('Press M to toggle outlines', 10, height - 20);
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

// Make variables global for module access
window.particles = particles;
window.continentPoints = continentPoints;
window.particleGeoData = particleGeoData;
window.geographyManager = geographyManager;
window.radioManager = radioManager;