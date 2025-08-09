// Main application for ISS Radio
// Global variables
const particles = [];
const numParticles = 50;
const continentPoints = [];
let particleGeoData = []; // Store original geographic data for particles
let radioManager;
let geographyManager;

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

  // Create regular particles positioned on continents
  particleGeoData = []; // Reset geographic data array
  window.particleGeoData = particleGeoData; // Make it global immediately
  window.particles = particles; // Make particles global immediately

  for (let i = 0; i < numParticles; i++) {
    const point = random(window.continentPoints);
    particles.push(new Particle(point.x, point.y, false));

    // Store geographic coordinates for this particle
    const geoCoords = geographyManager.xyToLatLon(point.x, point.y);
    particleGeoData.push(geoCoords);
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

// Keyboard shortcut for fullscreen
function keyPressed() {
  if (key === 'f' || key === 'F') {
    radioManager.toggleFullscreen();
  }
}

function draw() {
  background(0);

  // Optional: Draw continent outline points as tiny dots (press 'm' to toggle)
  if (keyIsPressed && key === 'm') {
    stroke(50);
    strokeWeight(1);
    for (const point of window.continentPoints) {
      point(point.x, point.y);
    }
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