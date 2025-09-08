// Agent by Night - Interactive Particle Animation
// P5.js Flowing Particle Background

// Mobile sensor data variables
let sensorData = {
  acceleration: { x: 0, y: 0, z: 0 },
  rotation: { alpha: 0, beta: 0, gamma: 0 },
  isMobile: false,
  sensorsActive: false
};

// Theme system variables
let themeSystem = {
  currentTheme: 'default',
  themes: {},
  isTransitioning: false,
  transitionProgress: 0
};

// Heartbeat system variables
let heartbeatSystem = {
  enabled: true, // Heartbeat effects enabled by default
  bpm: 75, // Beats per minute
  intensity: 1.0 // Master intensity multiplier
};

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('p5-canvas-container');

  // Initialize particles for enhanced spatial effect with better visibility (increased count)
  for (let i = 0; i < 280; i++) { // Increased from 180 to 280 particles
    particles.push(new Particle());
  }

  // Initialize theme system
  initializeThemes();

  // Initialize mobile sensor support
  initializeMobileSensors();

}

function draw() {
  // Get current theme
  const currentTheme = themeSystem.themes[themeSystem.currentTheme];

  // Theme-based background with faster pulsing
  let bgAlpha = 15 + sin(frameCount * 0.02) * 8; // Increased speed: was 0.008->0.02
  const bg = currentTheme.background;
  background(bg.r, bg.g, bg.b, bgAlpha);

  // Apply theme-specific special effects
  if (currentTheme.specialEffects) {
    applyThemeEffects(currentTheme.specialEffects);
  }

  // Update and display particles with theme colors
  for (let particle of particles) {
    particle.update();
    particle.display(currentTheme);
    particle.connect(particles, currentTheme);
  }

  // Mobile sensor status indicator (only on mobile devices)
  if (sensorData.isMobile && sensorData.sensorsActive) {
    fill(255, 255, 255, 120);
    noStroke();
    textSize(10);
    textAlign(LEFT);

    // Show sensor status
    let statusText = "📱 Sensors Active";
    text(statusText, 10, 20);

    // Show basic sensor data (optional debug info)
    if (frameCount % 30 === 0) { // Update less frequently to avoid performance impact
      textAlign(RIGHT);
      text(`Tilt: ${sensorData.rotation.gamma.toFixed(1)}°`, width - 10, 20);
      text(`Accel: ${sensorData.acceleration.z.toFixed(1)}`, width - 10, 35);
    }
  }

  // Performance info display removed - keep corner clean
  // if (frameCount % 60 === 0) { // Update every second
  //   fill(255, 255, 255, 100);
  //   noStroke();
  //   textSize(12);
  //   text(`Particles: ${particles.length}`, 10, 20);
  //   text(`FPS: ${Math.round(frameRate())}`, 10, 35);
  // }
}

function windowResized() {
  // Enhanced resize handling for fullscreen and window changes
  setTimeout(() => {
    const newWidth = windowWidth;
    const newHeight = windowHeight;

    // Resize canvas to new dimensions
    resizeCanvas(newWidth, newHeight);

    // Reposition particles if needed for better distribution
    if (particles && particles.length > 0) {
      // Optional: Redistribute particles for better fullscreen experience
      // This ensures particles are well distributed in the new screen size
      particles.forEach(particle => {
        // Keep particles within bounds
        if (particle.x > newWidth) particle.x = newWidth - 10;
        if (particle.y > newHeight) particle.y = newHeight - 10;
        if (particle.x < 0) particle.x = 10;
        if (particle.y < 0) particle.y = 10;
      });
    }

    console.log(`Canvas resized to: ${newWidth} x ${newHeight}`);
  }, 150); // Slightly longer delay for fullscreen transitions
}

// Mouse and Touch interaction functions
function mousePressed() {
  // Create ripple effect on mouse/touch
  handleInteraction(mouseX, mouseY, 2);
}

function mouseMoved() {
  // Subtle attraction to mouse cursor
  handleAttraction(mouseX, mouseY, 0.01);
}

// Touch event handlers for iOS and mobile devices
function touchStarted() {
  if (touches.length > 0) {
    handleInteraction(touches[0].x, touches[0].y, 2);
  }
  return false; // Prevent default touch behavior
}

function touchMoved() {
  if (touches.length > 0) {
    handleAttraction(touches[0].x, touches[0].y, 0.01);
  }
  return false; // Prevent scrolling
}

// Unified interaction handlers
function handleInteraction(x, y, forceMultiplier) {
  for (let particle of particles) {
    let d = dist(particle.x, particle.y, x, y);
    if (d < 100) {
      let force = map(d, 0, 100, forceMultiplier, 0);
      let angle = atan2(y - particle.y, x - particle.x);
      particle.vx -= cos(angle) * force;
      particle.vy -= sin(angle) * force;
    }
  }
}

function handleAttraction(x, y, forceMultiplier) {
  for (let particle of particles) {
    let d = dist(particle.x, particle.y, x, y);
    if (d < 120) {
      let force = map(d, 0, 120, forceMultiplier, 0);
      let angle = atan2(y - particle.y, x - particle.x);
      particle.vx += cos(angle) * force;
      particle.vy += sin(angle) * force;
    }
  }
}

let particles = [];

// Mobile sensor functions
function initializeMobileSensors() {
  // Detect if device is mobile/touch-enabled
  sensorData.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       ('ontouchstart' in window) ||
                       (window.innerWidth <= 768 && window.innerHeight <= 1024);

  if (sensorData.isMobile) {
    console.log('Mobile device detected - initializing sensors');

    // Request device orientation permission (for iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ requires explicit permission
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            setupSensorListeners();
          } else {
            console.log('Device orientation permission denied');
          }
        })
        .catch(console.error);
    } else {
      // Android and older iOS versions
      setupSensorListeners();
    }
  }
}

function setupSensorListeners() {
  // Device orientation (gyroscope) - provides alpha, beta, gamma
  window.addEventListener('deviceorientation', handleDeviceOrientation);

  // Device motion (accelerometer) - provides acceleration data
  window.addEventListener('devicemotion', handleDeviceMotion);

  sensorData.sensorsActive = true;
  console.log('Mobile sensors activated');
}

function handleDeviceOrientation(event) {
  // Normalize rotation data
  sensorData.rotation.alpha = event.alpha || 0; // Z-axis rotation (0-360°)
  sensorData.rotation.beta = event.beta || 0;   // X-axis rotation (-180 to 180°)
  sensorData.rotation.gamma = event.gamma || 0; // Y-axis rotation (-90 to 90°)

  // Smooth the data to prevent jerky movements
  sensorData.rotation.alpha = sensorData.rotation.alpha * 0.1 + (sensorData.rotation.lastAlpha || 0) * 0.9;
  sensorData.rotation.beta = sensorData.rotation.beta * 0.1 + (sensorData.rotation.lastBeta || 0) * 0.9;
  sensorData.rotation.gamma = sensorData.rotation.gamma * 0.1 + (sensorData.rotation.lastGamma || 0) * 0.9;

  // Store previous values for smoothing
  sensorData.rotation.lastAlpha = sensorData.rotation.alpha;
  sensorData.rotation.lastBeta = sensorData.rotation.beta;
  sensorData.rotation.lastGamma = sensorData.rotation.gamma;
}

function handleDeviceMotion(event) {
  const acceleration = event.accelerationIncludingGravity;

  if (acceleration) {
    // Normalize and smooth acceleration data
    sensorData.acceleration.x = acceleration.x * 0.1 + (sensorData.acceleration.lastX || 0) * 0.9;
    sensorData.acceleration.y = acceleration.y * 0.1 + (sensorData.acceleration.lastY || 0) * 0.9;
    sensorData.acceleration.z = acceleration.z * 0.1 + (sensorData.acceleration.lastZ || 0) * 0.9;

    // Store previous values for smoothing
    sensorData.acceleration.lastX = sensorData.acceleration.x;
    sensorData.acceleration.lastY = sensorData.acceleration.y;
    sensorData.acceleration.lastZ = sensorData.acceleration.z;
  }
}

// Heartbeat effect system
function createHeartbeatWave(time, bpm = 72) {
  // Convert BPM to frequency (beats per frame at 60fps)
  const beatFrequency = (bpm / 60) / 60;

  // Create heartbeat pattern: lub-dub with realistic timing
  // Phase 1: Quick small pulse (lub) - 0.1 of beat cycle
  // Phase 2: Larger pulse (dub) - 0.15 of beat cycle
  // Phase 3: Pause - rest of cycle

  const beatCycle = time * beatFrequency;
  const phase = beatCycle % 1; // Get fractional part for phase

  let heartbeatIntensity = 0;

  if (phase < 0.1) {
    // Lub: Quick small pulse
    heartbeatIntensity = sin(phase * 31.4) * 0.3; // sin(2π * 5) for 5 oscillations in 0.1 phase
  } else if (phase < 0.25) {
    // Dub: Larger, slower pulse
    const dubPhase = (phase - 0.1) / 0.15;
    heartbeatIntensity = sin(dubPhase * 12.56) * 0.6; // sin(2π * 2) for 2 oscillations in 0.15 phase
  }
  // Rest of cycle (0.25-1.0) has intensity = 0 for pause

  return heartbeatIntensity;
}

// Enhanced color palette for particles - more vibrant and high contrast (expanded)
const particleColors = [
  [255, 50, 100],   // Bright Pink
  [30, 144, 255],   // Bright Blue
  [255, 215, 0],    // Bright Yellow/Gold
  [0, 255, 200],    // Electric Cyan
  [186, 85, 255],   // Bright Purple
  [255, 100, 0],    // Bright Orange
  [255, 255, 255],  // Pure White
  [0, 191, 255],    // Deep Sky Blue
  [255, 20, 147],   // Deep Pink
  [50, 255, 50],    // Bright Lime Green
  [255, 0, 255],    // Magenta
  [0, 255, 100],    // Spring Green
  [255, 165, 0],    // Orange
  [75, 0, 130],     // Indigo
  [255, 105, 180],  // Hot Pink
  [0, 206, 209],    // Dark Turquoise
  [255, 69, 0],     // Red Orange
  [138, 43, 226],   // Blue Violet
  [255, 255, 0],    // Yellow
  [0, 255, 127],    // Spring Green
  [255, 140, 0],    // Dark Orange
  [148, 0, 211],    // Dark Violet
  [255, 192, 203],  // Pink
  [0, 250, 154],    // Medium Spring Green
  [255, 215, 0],    // Gold
  [75, 0, 130]      // Indigo
];

// Theme system initialization
function initializeThemes() {
  // Default theme (current behavior)
  themeSystem.themes.default = {
    name: 'Default',
    background: { r: 10, g: 10, b: 10 },
    particleColors: particleColors,
    connectionColor: [255, 255, 255, 80],
    specialEffects: null
  };

  // Space theme
  themeSystem.themes.space = {
    name: 'Space',
    background: { r: 5, g: 5, b: 15 },
    particleColors: [
      [255, 255, 255],    // White stars
      [150, 200, 255],    // Blue nebula
      [255, 150, 200],    // Pink nebula
      [200, 255, 150],    // Green nebula
      [255, 200, 100],    // Orange stars
      [100, 150, 255],    // Deep blue
      [255, 100, 255],    // Purple
      [150, 255, 255],    // Cyan
      [255, 100, 150],    // Hot pink nebula
      [100, 255, 200],    // Aquamarine
      [255, 220, 150],    // Warm white
      [180, 100, 255],    // Lavender
      [255, 180, 100],    // Peach
      [100, 180, 255],    // Sky blue
      [220, 255, 150],    // Lime nebula
      [255, 150, 255]     // Magenta
    ],
    connectionColor: [200, 220, 255, 60],
    specialEffects: 'starfield'
  };

  // Ocean theme
  themeSystem.themes.ocean = {
    name: 'Ocean',
    background: { r: 5, g: 15, b: 25 },
    particleColors: [
      [0, 150, 200],      // Deep ocean blue
      [0, 200, 255],      // Light blue
      [0, 255, 200],      // Cyan
      [100, 255, 200],    // Sea green
      [150, 255, 150],    // Mint
      [200, 255, 100],    // Lime
      [255, 255, 150],    // Pale yellow
      [150, 200, 255],    // Sky blue
      [255, 150, 200],    // Coral
      [200, 100, 150],    // Mauve
      [0, 100, 150],      // Deep navy
      [50, 255, 220],     // Bright turquoise
      [120, 200, 255],    // Powder blue
      [180, 255, 180],    // Light mint
      [255, 220, 150],    // Sandy yellow
      [100, 150, 200],    // Steel blue
      [255, 180, 220],    // Bubblegum pink
      [150, 220, 255],    // Light sky blue
      [220, 255, 200],    // Pale green
      [255, 200, 180]     // Salmon
    ],
    connectionColor: [100, 200, 255, 70],
    specialEffects: 'waves'
  };

  // Fire theme
  themeSystem.themes.fire = {
    name: 'Fire',
    background: { r: 15, g: 5, b: 0 },
    particleColors: [
      [255, 100, 0],      // Orange
      [255, 150, 0],      // Bright orange
      [255, 200, 0],      // Yellow-orange
      [255, 255, 100],    // Pale yellow
      [255, 150, 50],     // Dark orange
      [255, 80, 0],       // Red-orange
      [255, 255, 150],    // Warm yellow
      [255, 120, 30],     // Burnt orange
      [255, 180, 80],     // Peach
      [255, 220, 120],    // Cream
      [255, 50, 0],       // Red
      [255, 255, 0],      // Yellow
      [255, 165, 0],      // Orange
      [255, 69, 0],       // Red orange
      [255, 140, 0],      // Dark orange
      [255, 218, 185],    // Peach puff
      [255, 99, 71],      // Tomato
      [255, 160, 122],    // Light salmon
      [255, 228, 181],    // Moccasin
      [255, 250, 205]     // Lemon chiffon
    ],
    connectionColor: [255, 150, 50, 80],
    specialEffects: 'flicker'
  };

  // Forest theme
  themeSystem.themes.forest = {
    name: 'Forest',
    background: { r: 5, g: 15, b: 8 },
    particleColors: [
      [34, 139, 34],      // Forest green
      [0, 100, 0],        // Dark green
      [50, 205, 50],      // Lime green
      [107, 142, 35],     // Olive drab
      [85, 107, 47],      // Dark olive green
      [60, 179, 113],     // Medium sea green
      [46, 139, 87],      // Sea green
      [0, 128, 0],        // Green
      [25, 25, 112],      // Midnight blue
      [0, 191, 255],      // Deep sky blue
      [72, 209, 204],     // Medium turquoise
      [0, 206, 209],      // Dark turquoise
      [32, 178, 170],     // Light sea green
      [0, 139, 139],      // Dark cyan
      [0, 255, 127],      // Spring green
      [144, 238, 144]     // Light green
    ],
    connectionColor: [60, 179, 113, 70],
    specialEffects: 'forest'
  };

  // Neon theme
  themeSystem.themes.neon = {
    name: 'Neon',
    background: { r: 0, g: 0, b: 5 },
    particleColors: [
      [255, 0, 255],      // Magenta
      [0, 255, 255],      // Cyan
      [255, 255, 0],      // Yellow
      [255, 0, 128],      // Pink
      [0, 255, 128],      // Spring green
      [128, 0, 255],      // Purple
      [255, 128, 0],      // Orange
      [0, 128, 255],      // Blue
      [255, 0, 64],       // Red
      [0, 255, 64],       // Green
      [64, 0, 255],       // Indigo
      [255, 64, 0],       // Red orange
      [0, 64, 255],       // Royal blue
      [255, 255, 128],    // Light yellow
      [128, 255, 255],    // Light cyan
      [255, 128, 255]     // Light magenta
    ],
    connectionColor: [255, 255, 255, 90],
    specialEffects: 'heartbeat' // Changed from 'neon' to 'heartbeat' for dramatic effect
  };

  // Sunset theme
  themeSystem.themes.sunset = {
    name: 'Sunset',
    background: { r: 20, g: 8, b: 0 },
    particleColors: [
      [255, 69, 0],       // Red orange
      [255, 140, 0],      // Dark orange
      [255, 165, 0],      // Orange
      [255, 215, 0],      // Gold
      [255, 255, 0],      // Yellow
      [255, 99, 71],      // Tomato
      [255, 160, 122],    // Light salmon
      [255, 218, 185],    // Peach puff
      [255, 228, 181],    // Moccasin
      [255, 250, 205],    // Lemon chiffon
      [255, 69, 0],       // Red orange
      [255, 99, 71],      // Tomato
      [255, 140, 0],      // Dark orange
      [255, 165, 0],      // Orange
      [255, 215, 0],      // Gold
      [255, 255, 0]       // Yellow
    ],
    connectionColor: [255, 140, 0, 75],
    specialEffects: 'sunset'
  };

  // Galaxy theme
  themeSystem.themes.galaxy = {
    name: 'Galaxy',
    background: { r: 8, g: 0, b: 20 },
    particleColors: [
      [138, 43, 226],     // Blue violet
      [148, 0, 211],      // Dark violet
      [186, 85, 211],     // Medium orchid
      [147, 112, 219],    // Medium purple
      [255, 0, 255],      // Magenta
      [255, 20, 147],     // Deep pink
      [255, 105, 180],    // Hot pink
      [219, 112, 147],    // Pale violet red
      [221, 160, 221],    // Plum
      [238, 130, 238],    // Violet
      [255, 0, 128],      // Pink
      [255, 192, 203],    // Pink
      [255, 182, 193],    // Light pink
      [176, 196, 222],    // Light steel blue
      [135, 206, 235],    // Sky blue
      [70, 130, 180]      // Steel blue
    ],
    connectionColor: [186, 85, 211, 65],
    specialEffects: 'galaxy'
  };

  console.log('Theme system initialized with', Object.keys(themeSystem.themes).length, 'themes');
}

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-1.5, 1.5); // Increased speed: was -0.5 to 0.5
    this.vy = random(-1.5, 1.5); // Increased speed: was -0.5 to 0.5
    this.vz = random(-0.8, 0.8); // Increased 3D depth velocity: was -0.3 to 0.3
    this.z = random(0.1, 1); // Depth from 0.1 (far) to 1 (close)
    this.baseSize = random(1, 3);
    this.size = this.baseSize;
    this.alpha = random(150, 255); // Increased base alpha for better visibility
    // Assign a random color from the palette
    this.colorIndex = floor(random(particleColors.length));
    this.color = particleColors[this.colorIndex];

    // Trail effect properties
    this.trail = [];
    this.maxTrailLength = 15;

    // Mouse interaction properties
    this.mouseInfluence = 0;
    this.mouseDistance = 0;

    // Wave propagation
    this.wavePhase = random(TWO_PI);
    this.waveAmplitude = random(0.5, 2);
  }

  update() {
    // Store previous position for trail effect
    this.trail.push({x: this.x, y: this.y, z: this.z});
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Mouse interaction
    if (mouseX && mouseY) {
      this.mouseDistance = dist(this.x, this.y, mouseX, mouseY);
      let maxDistance = 150;
      if (this.mouseDistance < maxDistance) {
        this.mouseInfluence = map(this.mouseDistance, 0, maxDistance, 1, 0);
        let angle = atan2(mouseY - this.y, mouseX - this.x);
        let force = this.mouseInfluence * 0.02;
        this.vx += cos(angle) * force;
        this.vy += sin(angle) * force;
      } else {
        this.mouseInfluence = 0;
      }
    }

    // Mobile sensor integration
    if (sensorData.sensorsActive) {
      // Use device orientation to create gravitational pull
      let tiltForceX = map(sensorData.rotation.gamma, -90, 90, -0.02, 0.02);
      let tiltForceY = map(sensorData.rotation.beta, -180, 180, -0.02, 0.02);

      // Apply tilt-based forces (subtle but noticeable)
      this.vx += tiltForceX;
      this.vy += tiltForceY;

      // Use acceleration for sudden movement bursts
      let accelMagnitude = sqrt(
        sensorData.acceleration.x * sensorData.acceleration.x +
        sensorData.acceleration.y * sensorData.acceleration.y +
        sensorData.acceleration.z * sensorData.acceleration.z
      );

      if (accelMagnitude > 1.5) { // Threshold for sudden movements
        let accelForce = map(accelMagnitude, 1.5, 10, 0.01, 0.1);
        this.vx += sensorData.acceleration.x * accelForce * 0.01;
        this.vy += sensorData.acceleration.y * accelForce * 0.01;
        this.vz += sensorData.acceleration.z * accelForce * 0.005;
      }
    }

    // 3D depth movement
    this.z += this.vz * 0.01;
    if (this.z < 0.1) {
      this.z = 0.1;
      this.vz *= -0.8;
    }
    if (this.z > 1) {
      this.z = 1;
      this.vz *= -0.8;
    }

    // Dynamic size based on depth and velocity
    let velocity = sqrt(this.vx * this.vx + this.vy * this.vy);
    this.size = this.baseSize * this.z + velocity * 0.5;

    // Wave propagation effect (faster waves)
    let waveOffset = sin(frameCount * 0.05 + this.wavePhase) * this.waveAmplitude; // Increased speed: was 0.02->0.05
    this.x += waveOffset * 0.1;
    this.y += waveOffset * 0.05;

    // Enhanced flow behavior with depth influence (faster movement)
    let flowX = sin(frameCount * 0.025 + this.x * 0.01 + this.z * 10) * 0.15; // Increased speed: was 0.01->0.025, strength: 0.1->0.15
    let flowY = cos(frameCount * 0.025 + this.y * 0.01 + this.z * 10) * 0.15; // Increased speed: was 0.01->0.025, strength: 0.1->0.15
    this.x += this.vx + flowX;
    this.y += this.vy + flowY;

    // Apply gravitational forces with other particles
    this.applyGravitationalForces(particles);

    // Apply velocity damping (reduced for faster movement)
    this.vx *= 0.998; // Was 0.995, now 0.998 for less damping
    this.vy *= 0.998; // Was 0.995, now 0.998 for less damping
    this.vz *= 0.998; // Was 0.995, now 0.998 for less damping

    // Wrap around screen
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  display(theme) {
    // Draw trail effect first
    this.drawTrail();

    // Enhanced alpha calculation for better contrast based on theme
    const alphaMultiplier = 0.9; // Always use dark theme multiplier
    const depthAlpha = this.alpha * alphaMultiplier * this.z;

    // Calculate heartbeat effect
    const heartbeatIntensity = heartbeatSystem.enabled ?
      createHeartbeatWave(frameCount, heartbeatSystem.bpm) * heartbeatSystem.intensity : 0;
    const heartbeatSizeBoost = heartbeatIntensity * 2.5; // Dramatic size increase during heartbeat
    const heartbeatAlphaBoost = heartbeatIntensity * 0.8; // Alpha boost during heartbeat

    // Enhanced mouse influence glow effect with heartbeat enhancement
    if (this.mouseInfluence > 0 || heartbeatIntensity > 0) {
      let glowSize = this.size + this.mouseInfluence * 12 + heartbeatSizeBoost * 8;
      let glowAlpha = (depthAlpha * this.mouseInfluence * 0.5) + (depthAlpha * heartbeatAlphaBoost);
      // Add multiple glow layers for better effect
      fill(this.color[0], this.color[1], this.color[2], glowAlpha * 0.3);
      noStroke();
      circle(this.x, this.y, glowSize);
      fill(this.color[0], this.color[1], this.color[2], glowAlpha * 0.6);
      circle(this.x, this.y, glowSize * 0.7);

      // Extra heartbeat glow layer
      if (heartbeatIntensity > 0.1) {
        fill(255, 100, 150, glowAlpha * 0.4 * heartbeatIntensity); // Pinkish heartbeat glow
        circle(this.x, this.y, glowSize * 0.5);
      }
    }

    // Main particle with depth-based opacity and heartbeat boost
    const particleAlpha = depthAlpha + heartbeatAlphaBoost * 50;
    fill(this.color[0], this.color[1], this.color[2], particleAlpha);

    // Add pulsing effect based on wave with heartbeat enhancement
    let pulseSize = this.size + sin(frameCount * 0.12 + this.wavePhase) * 0.7 + heartbeatSizeBoost;
    noStroke();
    circle(this.x, this.y, pulseSize);

    // Enhanced bright core with heartbeat effect
    const coreAlpha = depthAlpha * 0.4 + heartbeatAlphaBoost * 80;
    fill(255, 255, 255, coreAlpha);
    circle(this.x, this.y, (this.size + heartbeatSizeBoost * 0.5) * 0.4);

    const innerCoreAlpha = depthAlpha * 0.8 + heartbeatAlphaBoost * 120;
    fill(255, 255, 255, innerCoreAlpha);
    circle(this.x, this.y, (this.size + heartbeatSizeBoost * 0.3) * 0.2);
  }

  drawTrail() {
    // Enhanced trail with better visibility and contrast
    for (let i = 0; i < this.trail.length; i++) {
      let trailPoint = this.trail[i];
      let trailAlpha = map(i, 0, this.trail.length - 1, 0, this.alpha * 0.5);
      let trailSize = map(i, 0, this.trail.length - 1, 0, this.size * 0.6);

      // Add slight glow to trail points
      fill(this.color[0], this.color[1], this.color[2], trailAlpha * 0.7);
      noStroke();
      circle(trailPoint.x, trailPoint.y, trailSize * 1.2);
      fill(this.color[0], this.color[1], this.color[2], trailAlpha);
      circle(trailPoint.x, trailPoint.y, trailSize);
    }
  }

  connect(particles, theme) {
    // Connect nearby particles with enhanced spatial effects
    for (let other of particles) {
      let d = dist(this.x, this.y, other.x, other.y);

      // Dynamic connection distance based on depth and mouse influence
      let maxConnectDistance = 80 + (this.z + other.z) * 20 + this.mouseInfluence * 30;

      if (d < maxConnectDistance && d > 0) {
        // Enhanced alpha calculation with depth and pulsing
        let alpha = map(d, 0, maxConnectDistance, 80, 0);
        alpha *= (this.z + other.z) * 0.5; // Depth-based opacity
        alpha *= (1 + this.mouseInfluence * 0.5); // Mouse influence boost

        // Add pulsing effect with heartbeat enhancement
        let pulse = sin(frameCount * 0.08 + this.wavePhase + other.wavePhase) * 0.5 + 0.5;
        alpha *= (0.5 + pulse * 0.5);

        // Add heartbeat effect to connection alpha
        const heartbeatIntensity = heartbeatSystem.enabled ?
          createHeartbeatWave(frameCount, heartbeatSystem.bpm) * heartbeatSystem.intensity : 0;
        const heartbeatConnectionBoost = heartbeatIntensity * 0.6;
        alpha += heartbeatConnectionBoost * 30;

        // Use theme's connection color or blend of particle colors
        let connectionColor;
        if (theme && theme.connectionColor) {
          connectionColor = theme.connectionColor;
        } else {
          // Fallback to blended particle colors
          connectionColor = [
            (this.color[0] + other.color[0]) / 2,
            (this.color[1] + other.color[1]) / 2,
            (this.color[2] + other.color[2]) / 2,
            alpha * 0.6
          ];
        }

        const connectionAlpha = connectionColor[3] || alpha * 0.6;
        stroke(connectionColor[0], connectionColor[1], connectionColor[2], connectionAlpha);

        // Enhanced stroke weight based on distance, depth, and heartbeat
        let strokeW = map(d, 0, maxConnectDistance, 3, 0.3) * (this.z + other.z) * 0.7;
        strokeW += heartbeatIntensity * 2; // Thicker lines during heartbeat
        strokeWeight(strokeW);

        // Draw curved connection line for more organic look
        this.drawCurvedConnection(other, strokeW);
      }
    }
  }

  drawCurvedConnection(other, strokeW) {
    // Draw a slightly curved connection for more organic look
    let midX = (this.x + other.x) / 2;
    let midY = (this.y + other.y) / 2;

    // Add small random offset for organic feel
    let offsetX = sin(frameCount * 0.01 + this.x * 0.01) * 5;
    let offsetY = cos(frameCount * 0.01 + this.y * 0.01) * 5;

    noFill();
    beginShape();
    vertex(this.x, this.y);
    quadraticVertex(midX + offsetX, midY + offsetY, other.x, other.y);
    endShape();
  }

  applyGravitationalForces(particles) {
    // Apply gravitational attraction to nearby particles
    for (let other of particles) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        let maxForceDistance = 60;

        if (d < maxForceDistance && d > 0) {
          // Calculate gravitational force (stronger attraction)
          let force = (this.z * other.z) / (d * d + 1); // Add 1 to prevent division by zero
          force *= 0.003; // Increased force: was 0.001->0.003

          // Apply force in the direction of the other particle
          let angle = atan2(other.y - this.y, other.x - this.x);
          this.vx += cos(angle) * force;
          this.vy += sin(angle) * force;
        }
      }
    }
  }
}

// Theme system functions
function applyThemeEffects(effectType) {
  switch (effectType) {
    case 'starfield':
      drawStarfield();
      break;
    case 'waves':
      applyWaveMotion();
      break;
    case 'flicker':
      applyFlickerEffect();
      break;
    case 'forest':
      applyForestEffect();
      break;
    case 'neon':
      applyNeonEffect();
      break;
    case 'sunset':
      applySunsetEffect();
      break;
    case 'galaxy':
      applyGalaxyEffect();
      break;
    case 'heartbeat':
      applyHeartbeatEffect();
      break;
  }
}

function drawStarfield() {
  // Add twinkling stars for space theme
  for (let i = 0; i < 50; i++) {
    const x = (i * 37) % width;
    const y = (i * 23) % height;
    const twinkle = sin(frameCount * 0.15 + i) * 0.5 + 0.5; // Faster twinkling: was 0.05->0.15

    fill(255, 255, 255, twinkle * 150);
    noStroke();
    circle(x, y, 1 + twinkle);
  }
}

function applyWaveMotion() {
  // Add wave motion to particles for ocean theme (faster waves)
  const waveStrength = 0.5; // Increased strength: was 0.3->0.5
  for (let particle of particles) {
    const waveX = sin(frameCount * 0.05 + particle.y * 0.01) * waveStrength; // Faster: was 0.02->0.05
    const waveY = cos(frameCount * 0.04 + particle.x * 0.01) * waveStrength; // Faster: was 0.015->0.04

    particle.x += waveX;
    particle.y += waveY;
  }
}

function applyFlickerEffect() {
  // Add flickering effect for fire theme (faster flickering)
  for (let particle of particles) {
    const flicker = sin(frameCount * 0.25 + particle.x * 0.01) * 0.3 + 0.8; // Faster: 0.1->0.25, stronger: 0.2->0.3
    particle.alpha *= flicker;
  }
}

function applyForestEffect() {
  // Add gentle organic movement for forest theme
  const forestStrength = 0.2;
  for (let particle of particles) {
    const organicX = sin(frameCount * 0.008 + particle.y * 0.005) * forestStrength;
    const organicY = cos(frameCount * 0.006 + particle.x * 0.003) * forestStrength;

    particle.x += organicX;
    particle.y += organicY;
  }
}

function applyNeonEffect() {
  // Add bright pulsing glow for neon theme
  for (let particle of particles) {
    const neonPulse = sin(frameCount * 0.15 + particle.wavePhase) * 0.4 + 0.8;
    particle.alpha *= neonPulse;
  }
}

function applySunsetEffect() {
  // Add warm gradient movement for sunset theme
  const sunsetStrength = 0.15;
  for (let particle of particles) {
    const sunsetX = sin(frameCount * 0.01 + particle.x * 0.008) * sunsetStrength;
    const sunsetY = cos(frameCount * 0.008 + particle.y * 0.006) * sunsetStrength;

    particle.x += sunsetX;
    particle.y += sunsetY;
  }
}

function applyGalaxyEffect() {
  // Add swirling galactic movement for galaxy theme
  const galaxyStrength = 0.25;
  for (let particle of particles) {
    const galaxyX = sin(frameCount * 0.012 + particle.wavePhase) * galaxyStrength;
    const galaxyY = cos(frameCount * 0.009 + particle.wavePhase * 1.5) * galaxyStrength;

    particle.x += galaxyX;
    particle.y += galaxyY;
  }
}

function applyHeartbeatEffect() {
  // Add enhanced heartbeat visual effects for themes that use it
  const heartbeatIntensity = heartbeatSystem.enabled ?
    createHeartbeatWave(frameCount, heartbeatSystem.bpm + 5) * heartbeatSystem.intensity : 0; // Slightly faster for theme effect

  // Add global heartbeat glow overlay
  if (heartbeatIntensity > 0.1) {
    fill(255, 20, 147, heartbeatIntensity * 20); // Deep pink overlay
    noStroke();
    rect(0, 0, width, height);
  }

  // Add pulsing effect to all particles with enhanced heartbeat
  for (let particle of particles) {
    const extraHeartbeatBoost = heartbeatIntensity * 1.5;
    particle.alpha *= (1 + extraHeartbeatBoost * 0.3);

    // Add extra glow during heartbeat peaks
    if (heartbeatIntensity > 0.3) {
      const glowX = particle.x + random(-5, 5);
      const glowY = particle.y + random(-5, 5);
      fill(particle.color[0], particle.color[1], particle.color[2], heartbeatIntensity * 30);
      noStroke();
      circle(glowX, glowY, particle.size * (1 + heartbeatIntensity * 2));
    }
  }
}

function switchTheme(themeName) {
  if (themeSystem.themes[themeName]) {
    console.log(`Switching to theme: ${themeName}`);
    themeSystem.currentTheme = themeName;
    themeSystem.isTransitioning = true;
    themeSystem.transitionProgress = 0;

    // Update all particles to use new theme colors
    for (let particle of particles) {
      const theme = themeSystem.themes[themeName];
      particle.colorIndex = floor(random(theme.particleColors.length));
      particle.color = theme.particleColors[particle.colorIndex];
    }
  }
}



// Auto-hide info box after 5 seconds
setTimeout(() => {
  const infoBox = document.getElementById('info-box');
  const infoToggle = document.getElementById('info-toggle');

  if (infoBox) {
    infoBox.classList.add('fade-out');

    // Keep toggle button hidden - never show it again
    setTimeout(() => {
      infoBox.style.display = 'none';
      // Button stays hidden permanently
      // if (infoToggle) {
      //   infoToggle.style.display = 'block';
      // }
    }, 1000);
  }
}, 5000);

// Auto theme switching system
let autoThemeEnabled = true;
let themeCycleIndex = 0;
const themeNames = ['default', 'space', 'ocean', 'fire', 'forest', 'neon', 'sunset', 'galaxy'];
let autoThemeInterval;

// Function to start/stop auto theme switching
function toggleAutoTheme() {
  autoThemeEnabled = !autoThemeEnabled;

  if (autoThemeEnabled) {
    console.log('Auto theme switching enabled - themes will change every 5 seconds');
    startAutoThemeCycle();
  } else {
    console.log('Auto theme switching disabled');
    stopAutoThemeCycle();
  }
}

// Start the automatic theme cycling
function startAutoThemeCycle() {
  // Switch to next theme immediately
  switchToNextTheme();

  // Set up interval for subsequent switches
  autoThemeInterval = setInterval(() => {
    switchToNextTheme();
  }, 5000); // 5 seconds
}

// Stop the automatic theme cycling
function stopAutoThemeCycle() {
  if (autoThemeInterval) {
    clearInterval(autoThemeInterval);
    autoThemeInterval = null;
  }
}

// Switch to the next theme in the cycle
function switchToNextTheme() {
  // Get next theme
  const nextTheme = themeNames[themeCycleIndex];

  // Switch to it
  switchTheme(nextTheme);

  // Move to next theme index, loop back to 0 if at end
  themeCycleIndex = (themeCycleIndex + 1) % themeNames.length;

  console.log(`Auto-switched to theme: ${nextTheme}`);
}

// Add keyboard shortcut to toggle heartbeat effect (press 'H')
document.addEventListener('keydown', (event) => {
  if (event.key === 'h' || event.key === 'H') {
    toggleHeartbeat();
    event.preventDefault(); // Prevent default browser behavior
  }
});

// Function to toggle heartbeat effect
function toggleHeartbeat() {
  heartbeatSystem.enabled = !heartbeatSystem.enabled;
  console.log(`Heartbeat effect ${heartbeatSystem.enabled ? 'enabled' : 'disabled'}`);
}

// Handle toggle button clicks
document.addEventListener('DOMContentLoaded', () => {
  const showInfoBtn = document.getElementById('show-info-btn');
  const infoBox = document.getElementById('info-box');
  const infoToggle = document.getElementById('info-toggle');

  if (showInfoBtn && infoBox && infoToggle) {
    showInfoBtn.addEventListener('click', () => {
      // Hide toggle button
      infoToggle.style.display = 'none';

      // Show info box with fade-in effect
      infoBox.style.display = 'block';
      infoBox.classList.remove('fade-out');
      infoBox.style.opacity = '1';
      infoBox.style.transform = 'translateX(0)';

      // Auto-hide again after 8 seconds
      setTimeout(() => {
        infoBox.classList.add('fade-out');
        setTimeout(() => {
          infoBox.style.display = 'none';
          // Keep toggle button hidden after manual show/hide cycle
          // infoToggle.style.display = 'block'; // Commented out to keep button hidden
        }, 1000);
      }, 8000);
    });
  }

  // Fullscreen functionality
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  if (fullscreenBtn) {
    // Check if fullscreen is supported
    if (document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.msRequestFullscreen) {

      fullscreenBtn.addEventListener('click', () => {
        if (!isFullscreen()) {
          enterFullscreen();
        } else {
          exitFullscreen();
        }
      });
      updateFullscreenButton();

      // Listen for fullscreen changes with enhanced resize handling
      const handleFullscreenChange = () => {
        updateFullscreenButton();
        // Force canvas resize after fullscreen change
        setTimeout(() => {
          if (typeof windowResized === 'function') {
            windowResized();
          }
          // Redistribute particles for better fullscreen experience
          setTimeout(() => {
            redistributeParticlesForFullscreen();
          }, 300);
        }, 200); // Longer delay for fullscreen transitions
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);

      // Also listen for orientation change on mobile devices
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          if (typeof windowResized === 'function') {
            windowResized();
          }
        }, 500); // Even longer delay for orientation changes
      });
    } else {
      // Hide button if fullscreen is not supported
      fullscreenBtn.style.display = 'none';
    }
  }

  // Auto-start theme switching
  console.log('Starting auto theme switching...');
  startAutoThemeCycle();


  function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  function isFullscreen() {
    return !!(document.fullscreenElement ||
              document.webkitFullscreenElement ||
              document.msFullscreenElement);
  }

  function updateFullscreenButton() {
    const isCurrentlyFullscreen = isFullscreen();
    fullscreenBtn.textContent = isCurrentlyFullscreen ? '⛶' : '⛶';
    fullscreenBtn.title = isCurrentlyFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
  }

  function redistributeParticlesForFullscreen() {
    if (particles && particles.length > 0) {
      const isCurrentlyFullscreen = isFullscreen();
      const screenWidth = windowWidth;
      const screenHeight = windowHeight;

      // In fullscreen, spread particles more evenly across the larger screen
      if (isCurrentlyFullscreen) {
        particles.forEach((particle, index) => {
          // Create a more even distribution pattern
          const cols = Math.ceil(Math.sqrt(particles.length));
          const rows = Math.ceil(particles.length / cols);
          const col = index % cols;
          const row = Math.floor(index / cols);

          const spacingX = screenWidth / cols;
          const spacingY = screenHeight / rows;

          // Add some randomness to prevent perfect grid
          const randomOffsetX = (Math.random() - 0.5) * spacingX * 0.5;
          const randomOffsetY = (Math.random() - 0.5) * spacingY * 0.5;

          particle.x = col * spacingX + spacingX / 2 + randomOffsetX;
          particle.y = row * spacingY + spacingY / 2 + randomOffsetY;

          // Keep particles within bounds
          particle.x = Math.max(20, Math.min(screenWidth - 20, particle.x));
          particle.y = Math.max(20, Math.min(screenHeight - 20, particle.y));

          // Reset velocities to prevent chaotic movement after resize
          particle.vx *= 0.5;
          particle.vy *= 0.5;
        });
        console.log(`Particles redistributed for fullscreen: ${screenWidth}x${screenHeight}`);
      }
    }
  }
});
