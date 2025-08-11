/* eslint-env browser */
/* global setup, draw, windowResized, keyPressed, createCanvas, background, fill, noStroke, circle, text, textSize, key, keyIsPressed, width, height, random, constrain, lerp, dist, cos, sin, TWO_PI, rect, navigator */

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

  // Initialize onboarding hint AFTER everything is loaded and settled
  setTimeout(() => {
    initOnboardingHint();
  }, 3000); // Wait 3 seconds after setup completes
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

}

// Onboarding hint functionality
function initOnboardingHint() {
  const timestamp = Date.now();
  console.log(`🚀 [${timestamp}] initOnboardingHint() called`);

  const hintElement = document.getElementById('onboarding-hint');
  console.log(`🔍 [${Date.now() - timestamp}ms] hintElement found:`, !!hintElement);

  if (!hintElement) {
    console.error('❌ Onboarding hint element not found!');
    return;
  }

  // Check if user has seen the hint before (localStorage)
  const hasSeenOnboarding = window.localStorage.getItem('radio-iss-onboarding-seen');
  console.log(`💾 [${Date.now() - timestamp}ms] localStorage check:`, hasSeenOnboarding);

  if (hasSeenOnboarding === 'true' || hasSeenOnboarding === '1') {
    console.log('👀 User has seen onboarding before, hiding element');
    hintElement.style.display = 'none';
    return;
  }

  console.log(`✨ [${Date.now() - timestamp}ms] Onboarding hint will be visible - starting 7s timer`);
  console.log('📏 Element styles:', {
    display: hintElement.style.display,
    opacity: hintElement.style.opacity,
    visibility: hintElement.style.visibility,
    classList: hintElement.classList.toString()
  });

  let isHidden = false;
  let fadeReason = '';

  // Auto-fade after 7 seconds
  const autoFadeTimeout = window.setTimeout(() => {
    const elapsed = Date.now() - timestamp;
    console.log(`⏰ [${elapsed}ms] Auto-fade timeout triggered after ${elapsed}ms`);
    fadeReason = 'auto-timeout';
    fadeOutHint();
  }, 7000);

  function fadeOutHint() {
    const elapsed = Date.now() - timestamp;
    if (isHidden) {
      console.log(`🔄 [${elapsed}ms] fadeOutHint called but already hidden (reason was: ${fadeReason})`);
      return;
    }
    isHidden = true;

    console.log(`🌅 [${elapsed}ms] FADING OUT onboarding hint (reason: ${fadeReason})`);
    console.log('📏 Element state before fade:', {
      display: hintElement.style.display,
      opacity: hintElement.style.opacity,
      classList: hintElement.classList.toString(),
      parentNode: !!hintElement.parentNode
    });

    hintElement.classList.add('fade-out');
    window.localStorage.setItem('radio-iss-onboarding-seen', 'true');

    // Remove element from DOM after transition
    window.setTimeout(() => {
      const finalElapsed = Date.now() - timestamp;
      console.log(`🗑️ [${finalElapsed}ms] Removing element from DOM`);
      if (hintElement.parentNode) {
        hintElement.parentNode.removeChild(hintElement);
      }
    }, 500);
  }

  // Hide on deliberate user interaction (not automatic events)
  const hideOnInteraction = (e) => {
    const elapsed = Date.now() - timestamp;
    console.log(`👆 [${elapsed}ms] User interaction detected:`, e.type, e.target, e.target.tagName);
    fadeReason = `user-${e.type}`;
    window.clearTimeout(autoFadeTimeout);
    fadeOutHint();
  };

  // Wait 4 seconds before adding interaction listeners - hint should be clearly visible by then
  window.setTimeout(() => {
    const elapsed = Date.now() - timestamp;
    console.log(`🎯 [${elapsed}ms] Adding interaction listeners`);
    document.addEventListener('click', hideOnInteraction, { once: true });
    document.addEventListener('touchstart', hideOnInteraction, { once: true });
  }, 4000); // Increased to 4 seconds to ensure hint is stable

  // Additional debugging - check if element gets hidden by other means
  const observer = new window.MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const elapsed = Date.now() - timestamp;
        console.log(`🎨 [${elapsed}ms] Element style changed:`, hintElement.style.cssText);
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const elapsed = Date.now() - timestamp;
        console.log(`📝 [${elapsed}ms] Element class changed:`, hintElement.className);
      }
    });
  });
  observer.observe(hintElement, { attributes: true, attributeFilter: ['style', 'class'] });

  // Clean up observer after 10 seconds
  window.setTimeout(() => {
    observer.disconnect();
    console.log('🧹 Disconnected mutation observer');
  }, 10000);
}

// Make variables global for module access
window.particles = particles;
window.continentPoints = continentPoints;
window.particleGeoData = particleGeoData;
window.geographyManager = geographyManager;
window.radioManager = radioManager;