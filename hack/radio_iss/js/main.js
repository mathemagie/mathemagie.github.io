/* eslint-env browser */
/* global setup, draw, windowResized, keyPressed, createCanvas, background, fill, noStroke, stroke, strokeWeight, line, circle, text, textSize, key, keyIsPressed, width, height, random, constrain, lerp, dist, cos, sin, TWO_PI, rect, millis, navigator, windowWidth, windowHeight, resizeCanvas, RadioManager, GeographyManager, Particle, AudioVisualizer */

// Main application for 25544.fm (ISS Orbital Radio)
// Global variables
const particles = [];

// Mobile detection function
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (typeof window.orientation !== 'undefined') ||
         window.innerWidth <= 768;
}

const numParticles = isMobileDevice() ? 75 : 150;
let particleGeoData = [];
let radioManager;
let geographyManager;
let audioVisualizer;
let showContinentOutlines = false;
let stars = [];

function generateStars() {
  const count = isMobileDevice() ? 40 : 80;
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * windowWidth,
      y: Math.random() * windowHeight,
      r: Math.random() * 1.2 + 0.3,
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

const CONTINENT_LABELS = {
  northAmerica: 'north america',
  southAmerica: 'south america',
  europe: 'europe',
  africa: 'africa',
  asia: 'asia',
  oceania: 'oceania'
};
let continentCentroids = {};

function recomputeCentroids() {
  continentCentroids = {};
  if (!window.continentGroups) {return;}
  for (const [name, points] of Object.entries(window.continentGroups)) {
    if (!points.length) {continue;}
    let sx = 0, sy = 0;
    for (const p of points) { sx += p.x; sy += p.y; }
    continentCentroids[name] = { x: sx / points.length, y: sy / points.length };
  }
}

let issContinentCheckTick = 0;
function updateIssContinent() {
  // Cheap polling: every ~20 frames find which continent has a point closest to the ISS.
  if (issContinentCheckTick++ % 20 !== 0) {return;}
  const list = window.particles;
  if (!list || !list.length) {return;}
  const iss = list[list.length - 1];
  if (!iss || !iss.isIss) {return;}
  let best = null;
  let bestD = Infinity;
  const points = window.continentPoints || [];
  for (const p of points) {
    const dx = p.x - iss.pos.x;
    const dy = p.y - iss.pos.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) { bestD = d; best = p.continent; }
  }
  // Only highlight if the ISS is reasonably close (within ~12% of viewport diag).
  const threshold = Math.pow(Math.min(width, height) * 0.18, 2);
  window.currentIssContinent = bestD < threshold ? best : null;
}

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
  generateStars();

  // Initialize managers
  radioManager = new RadioManager();
  geographyManager = new GeographyManager();
  audioVisualizer = new AudioVisualizer();

  // Make managers globally accessible immediately
  window.geographyManager = geographyManager;
  window.radioManager = radioManager;
  window.audioVisualizer = audioVisualizer;

  // Initialize radio UI
  radioManager.init();

  // Initialize audio visualizer (creates toggle button in ISS context overlay)
  audioVisualizer.init();

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
  recomputeCentroids();
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
        particles.push(new Particle(point.x, point.y, false, continentName));

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
  resizeCanvas(windowWidth, windowHeight);
  generateStars();

  window.clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    const manager = window.geographyManager || geographyManager;
    if (manager) {
      manager.repositionParticlesAfterResize();
      recomputeCentroids();
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
}

function draw() {
  // Update audio visualizer
  if (audioVisualizer) {
    audioVisualizer.update();
  }

  // Deep-space background — slight blue tint reads as orbit, not arcade.
  if (audioVisualizer && audioVisualizer.isActive()) {
    const bassGlow = audioVisualizer.bassLevel * 15;
    background(2 + bassGlow, 6, 17 + bassGlow * 0.3);
  } else {
    background(2, 6, 17);
  }

  // Ambient starfield — Law #6 Context: "nothing is something."
  noStroke();
  const t = millis() * 0.001;
  for (const s of stars) {
    const a = 80 + Math.sin(t + s.twinkle) * 60;
    fill(200, 220, 255, a);
    circle(s.x, s.y, s.r);
  }

  // Faint equator — Law #6: a single reference line so the user is never lost.
  stroke(255, 255, 255, 14);
  strokeWeight(1);
  line(0, height / 2, width, height / 2);
  noStroke();

  // Track which continent the ISS is currently above (for the heartbeat pulse).
  updateIssContinent();

  // Draw continent outline points as tiny dots (press 'm' to toggle)
  if (showContinentOutlines && window.continentPoints) {
    fill(100, 100, 200, 150); // Light blue color with transparency
    noStroke();
    for (const point of window.continentPoints) {
      circle(point.x, point.y, 4); // Draw small circles for continent points
    }

    // Debug info with improved layout
    const debugInfoX = 10;
    const debugLines = window.continentGroups ? Object.keys(window.continentGroups).length + 4 : 3;
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

  // Tiny continent labels — Law #4 (Relate): help the eye recognize the map.
  noStroke();
  textSize(10);
  for (const [name, c] of Object.entries(continentCentroids)) {
    const isHot = name === window.currentIssContinent;
    fill(255, 255, 255, isHot ? 140 : 60);
    text(CONTINENT_LABELS[name] || name, c.x, c.y);
  }
}

