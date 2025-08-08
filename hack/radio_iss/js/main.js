// Main application for ISS Radio
// Global variables
let particles = [];
const numParticles = 50;
let continentPoints = [];
let particleGeoData = []; // Store original geographic data for particles
let radioManager;
let geographyManager;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize managers
  radioManager = new RadioManager();
  geographyManager = new GeographyManager();
  
  // Initialize radio UI
  radioManager.init();
  
  // Set up fullscreen event listeners for canvas resizing
  document.addEventListener('fullscreenchange', () => {
    resizeCanvas(windowWidth, windowHeight);
    geographyManager.repositionParticlesAfterResize();
  });
  document.addEventListener('webkitfullscreenchange', () => {
    resizeCanvas(windowWidth, windowHeight);
    geographyManager.repositionParticlesAfterResize();
  });
  
  // Generate continent outline points
  geographyManager.generateContinentPoints();
  
  // Create regular particles positioned on continents
  particleGeoData = []; // Reset geographic data array
  for (let i = 0; i < numParticles; i++) {
    let point = random(window.continentPoints);
    particles.push(new Particle(point.x, point.y, false));
    
    // Store geographic coordinates for this particle
    let geoCoords = geographyManager.xyToLatLon(point.x, point.y);
    particleGeoData.push(geoCoords);
  }
  
  // Create ISS particle
  let iss = new Particle(width / 2, height / 2, true);
  particles.push(iss);
  
  // Initialize ISS geographic data
  geographyManager.issGeoData = geographyManager.xyToLatLon(width / 2, height / 2);
  
  // Start ISS tracking
  geographyManager.initTracking(radioManager);
}

// Enhanced resize handling - repositions all particles properly
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  geographyManager.repositionParticlesAfterResize();
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
    for (let point of window.continentPoints) {
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
  for (let particle of particles) {
    particle.update();
    particle.show();
  }
}

// Make variables global for module access
window.particles = particles;
window.continentPoints = continentPoints;
window.particleGeoData = particleGeoData;