/* eslint-env browser */
/* global setup, draw, windowResized, keyPressed, createCanvas, createGraphics, image, background, fill, noStroke, stroke, strokeWeight, line, circle, text, textSize, key, keyIsPressed, width, height, random, constrain, lerp, dist, cos, sin, TWO_PI, rect, millis, navigator, windowWidth, windowHeight, resizeCanvas, RadioManager, GeographyManager, Particle, AudioVisualizer, CONTINENT_PALETTE, DEFAULT_CONTINENT_COLOR */

// Main application for 25544.fm (ISS Orbital Radio)
// Global variables
const particles = [];

// Mobile detection function
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (typeof window.orientation !== 'undefined') ||
         window.innerWidth <= 768;
}

const numParticles = isMobileDevice() ? 600 : 1200;
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

// Iconic cities — Maeda Law #4 (Relate) + #10. Reveal label only when ISS is close.
const ICONIC_CITIES = [
  { name: 'New York', lat: 40.71, lon: -74.01 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13 },
  { name: 'Vancouver', lat: 49.28, lon: -123.12 },
  { name: 'São Paulo', lat: -23.55, lon: -46.63 },
  { name: 'Buenos Aires', lat: -34.61, lon: -58.38 },
  { name: 'Lima', lat: -12.05, lon: -77.04 },
  { name: 'Bogotá', lat: 4.71, lon: -74.07 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'Paris', lat: 48.86, lon: 2.35 },
  { name: 'Berlin', lat: 52.52, lon: 13.40 },
  { name: 'Madrid', lat: 40.42, lon: -3.70 },
  { name: 'Rome', lat: 41.90, lon: 12.50 },
  { name: 'Moscow', lat: 55.76, lon: 37.62 },
  { name: 'Istanbul', lat: 41.01, lon: 28.98 },
  { name: 'Cairo', lat: 30.04, lon: 31.24 },
  { name: 'Lagos', lat: 6.52, lon: 3.38 },
  { name: 'Nairobi', lat: -1.29, lon: 36.82 },
  { name: 'Cape Town', lat: -33.92, lon: 18.42 },
  { name: 'Tokyo', lat: 35.68, lon: 139.65 },
  { name: 'Beijing', lat: 39.90, lon: 116.41 },
  { name: 'Shanghai', lat: 31.23, lon: 121.47 },
  { name: 'Delhi', lat: 28.61, lon: 77.21 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Bangkok', lat: 13.76, lon: 100.50 },
  { name: 'Seoul', lat: 37.57, lon: 126.98 },
  { name: 'Jakarta', lat: -6.21, lon: 106.85 },
  { name: 'Sydney', lat: -33.87, lon: 151.21 },
  { name: 'Auckland', lat: -36.85, lon: 174.76 },
  { name: 'Dubai', lat: 25.20, lon: 55.27 }
];

function drawGraticule() {
  // Five reference lines: prime meridian, ±90° meridians, two tropics. All ghostly.
  stroke(255, 255, 255, 14);
  strokeWeight(1);
  // Prime meridian (lon 0)
  const x0 = width * 0.5;
  line(x0, 0, x0, height);
  // ±90° meridians
  line(width * 0.25, 0, width * 0.25, height);
  line(width * 0.75, 0, width * 0.75, height);
  // Equator already drawn elsewhere; tropics:
  const tropicY = (lat) => (90 - lat) / 180 * height;
  line(0, tropicY(23.4), width, tropicY(23.4));
  line(0, tropicY(-23.4), width, tropicY(-23.4));
  noStroke();
}

function drawCities() {
  if (!geographyManager) {return;}
  const issList = window.particles;
  const iss = issList && issList.length ? issList[issList.length - 1] : null;
  const issX = iss && iss.isIss ? iss.pos.x : -1e9;
  const issY = iss && iss.isIss ? iss.pos.y : -1e9;
  const proximityPx = Math.min(width, height) * 0.08;

  for (const c of ICONIC_CITIES) {
    const xy = geographyManager.latLonToXY(c.lat, c.lon);
    fill(255, 255, 255, 110);
    noStroke();
    circle(xy.x, xy.y, 2.5);
    const dx = xy.x - issX;
    const dy = xy.y - issY;
    if (dx * dx + dy * dy < proximityPx * proximityPx) {
      fill(255, 255, 255, 200);
      textSize(10);
      text(c.name, xy.x + 6, xy.y - 4);
    }
  }
}

// Day/night shading — pre-rendered into an offscreen buffer, refreshed every
// minute. Per-frame cost drops from 3200 rect() calls to one image() blit.
let nightBuffer = null;
let nightBufferStamp = 0;
const NIGHT_COLS = 80;
const NIGHT_ROWS = 40;

function repaintNightBuffer() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const declR = (23.45 * Math.sin(2 * Math.PI * (dayOfYear - 81) / 365)) * Math.PI / 180;
  const utcH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const subR = ((12 - utcH) * 15) * Math.PI / 180;
  const sinD = Math.sin(declR);
  const cosD = Math.cos(declR);

  const cw = width / NIGHT_COLS;
  const ch = height / NIGHT_ROWS;
  nightBuffer.clear();
  nightBuffer.noStroke();
  for (let i = 0; i < NIGHT_COLS; i++) {
    const lon = -180 + (360 * (i + 0.5) / NIGHT_COLS);
    const cosDH = cosD * Math.cos(lon * Math.PI / 180 - subR);
    for (let j = 0; j < NIGHT_ROWS; j++) {
      const lat = 90 - (180 * (j + 0.5) / NIGHT_ROWS);
      const latR = lat * Math.PI / 180;
      const cosZ = Math.sin(latR) * sinD + Math.cos(latR) * cosDH;
      const a = cosZ < 0 ? Math.min(1, -cosZ * 1.6) : 0;
      if (a <= 0.05) {continue;}
      nightBuffer.fill(0, 2, 10, a * 190);
      nightBuffer.rect(i * cw, j * ch, cw + 1, ch + 1);
    }
  }
  nightBufferStamp = Date.now();
}

function drawNightShade() {
  if (!nightBuffer || nightBuffer.width !== width || nightBuffer.height !== height) {
    nightBuffer = createGraphics(width, height);
    repaintNightBuffer();
  } else if (Date.now() - nightBufferStamp > 60000) {
    repaintNightBuffer();
  }
  image(nightBuffer, 0, 0);
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

  particleGeoData = [];
  window.particleGeoData = particleGeoData;
  window.particles = particles;

  buildContinentParticles();

  // Create ISS particle
  const iss = new Particle(width / 2, height / 2, true);
  particles.push(iss);

  geographyManager.issGeoData = geographyManager.xyToLatLon(width / 2, height / 2);
  geographyManager.initTracking(radioManager);

  // Asynchronously upgrade to real Natural Earth coastlines.
  geographyManager.loadHighPrecisionCoastline(numParticles)
    .then(() => {
      recomputeCentroids();
      buildContinentParticles();
      // Re-pin ISS to end of array so all the "last particle is ISS" code keeps working.
      const issIdx = particles.indexOf(iss);
      if (issIdx >= 0 && issIdx !== particles.length - 1) {
        particles.splice(issIdx, 1);
        particles.push(iss);
      } else if (issIdx < 0) {
        particles.push(iss);
      }
    })
    .catch(err => console.warn('coastline upgrade skipped:', err.message));
}

// Build continent particles from window.continentGroups. Drops any existing
// non-ISS particles first. The ISS particle (if present) is preserved.
function buildContinentParticles() {
  const iss = particles.find(p => p.isIss) || null;
  particles.length = 0;
  particleGeoData.length = 0;

  const groupNames = Object.keys(window.continentGroups || {});
  if (groupNames.length === 0 || !window.continentPoints || window.continentPoints.length === 0) {
    for (let i = 0; i < numParticles; i++) {
      const x = random(width);
      const y = random(height);
      particles.push(new Particle(x, y, false));
      particleGeoData.push(geographyManager.xyToLatLon(x, y));
    }
  } else {
    const totalPoints = window.continentPoints.length;
    let created = 0;
    for (const name of groupNames) {
      const pts = window.continentGroups[name];
      if (!pts || pts.length === 0) {continue;}
      const share = Math.round(numParticles * pts.length / totalPoints);
      for (let i = 0; i < share; i++) {
        const p = pts[Math.floor(Math.random() * pts.length)];
        particles.push(new Particle(p.x, p.y, false, name));
        particleGeoData.push(geographyManager.xyToLatLon(p.x, p.y));
        created++;
      }
    }
    // Fill any rounding gap from the largest group.
    while (created < numParticles) {
      const biggest = groupNames.reduce((a, b) =>
        (window.continentGroups[a]?.length || 0) > (window.continentGroups[b]?.length || 0) ? a : b);
      const pts = window.continentGroups[biggest];
      const p = pts[Math.floor(Math.random() * pts.length)];
      particles.push(new Particle(p.x, p.y, false, biggest));
      particleGeoData.push(geographyManager.xyToLatLon(p.x, p.y));
      created++;
    }
  }

  if (iss) {particles.push(iss);}
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

  // Day/night terminator — the meaningful "is the ISS in sunlight?" answer.
  drawNightShade();

  // Ghostly graticule for spatial reference (Law #6 Context).
  drawGraticule();

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

  // Collisions: only ISS-vs-others (for the bubble reset effect) plus
  // moving-vs-moving among non-ISS particles. Static-vs-static is a no-op,
  // so skipping it cuts the cost from O(n²) to roughly O(n).
  const iss = particles[particles.length - 1];
  if (iss && iss.isIss) {
    for (let i = 0; i < particles.length - 1; i++) {
      iss.collides(particles[i]);
    }
  }
  const moving = [];
  for (const p of particles) {
    if (!p.isIss && p.isMoving && !p.isResetting) {moving.push(p);}
  }
  for (let i = 0; i < moving.length; i++) {
    for (let j = i + 1; j < moving.length; j++) {
      moving[i].collides(moving[j]);
    }
  }

  // Per-frame pulse amp (heartbeat) — computed ONCE, read by all batched
  // particles instead of recomputing 1200 times.
  const tt = (millis() % 1100) / 1100;
  const pulseAmp =
    Math.exp(-Math.pow((tt - 0.06) / 0.08, 2)) +
    0.6 * Math.exp(-Math.pow((tt - 0.26) / 0.08, 2));
  window.currentPulseAmp = pulseAmp;

  // Group particles: batched static dots vs individually-drawn dynamics.
  const staticByContinent = {};
  const dynamicParticles = [];
  let issParticle = null;
  for (const p of particles) {
    if (p.isIss) {issParticle = p; continue;}
    if (p.isResetting || p.isMoving) {dynamicParticles.push(p); continue;}
    const key = p.continent || '_';
    if (!staticByContinent[key]) {staticByContinent[key] = [];}
    staticByContinent[key].push(p);
  }

  // Update only what actually moves.
  for (const p of dynamicParticles) {p.update();}
  if (issParticle) {issParticle.update();}

  // Batch-draw static coastline dots: one fill() per continent, then all circles.
  noStroke();
  for (const continent in staticByContinent) {
    const list = staticByContinent[continent];
    const rgb = CONTINENT_PALETTE[continent] || DEFAULT_CONTINENT_COLOR;
    const isHot = continent === window.currentIssContinent;
    const alpha = 140 + (isHot ? pulseAmp * 90 : 0);
    const rBoost = isHot ? (1 + pulseAmp * 0.18) : 1;
    fill(rgb[0], rgb[1], rgb[2], alpha);
    for (const p of list) {
      circle(p.pos.x, p.pos.y, p.r * 2 * rBoost);
    }
  }

  // Dynamics & ISS still draw individually (soap-bubble effect, heartbeat ring).
  for (const p of dynamicParticles) {p.show();}
  if (issParticle) {issParticle.show();}

  // Iconic city markers — minimal until the ISS approaches.
  drawCities();

  // Only label the continent the ISS is over — answer to "where am I?", not decor.
  const hot = window.currentIssContinent;
  if (hot && continentCentroids[hot]) {
    const c = continentCentroids[hot];
    noStroke();
    textSize(11);
    fill(255, 255, 255, 170);
    text(CONTINENT_LABELS[hot] || hot, c.x, c.y);
  }
}

