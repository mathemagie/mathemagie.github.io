// Check if debug mode is enabled in URL
const urlParams = new URLSearchParams(window.location.search);
const debugMode = urlParams.get('debug') === '1';

// Get references to controls and nebula
const nebula = document.querySelector('.nebula');
const controlsPanel = document.getElementById('controls-panel');
const toggleButton = document.getElementById('toggle-controls');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const intensityInput = document.getElementById('intensity');
const intensityValue = document.getElementById('intensity-value');
const saturationInput = document.getElementById('saturation');
const saturationValue = document.getElementById('saturation-value');
const hueShiftInput = document.getElementById('hue-shift');
const hueShiftValue = document.getElementById('hue-shift-value');
const scaleInput = document.getElementById('scale');
const scaleValue = document.getElementById('scale-value');
const fullscreenButton = document.getElementById('fullscreen-button');

// Show controls only if debug=1 in URL
let debugVisible = debugMode;
if (debugVisible) {
  controlsPanel.classList.add('debug-mode');
  toggleButton.classList.add('debug-mode');
}

// Toggle controls visibility (start collapsed on small screens so the nebula stays visible)
const isMobile = window.matchMedia('(max-width: 768px)').matches;
let controlsVisible = !isMobile;
if (!controlsVisible) {
  controlsPanel.classList.add('hidden');
  toggleButton.textContent = '⚙️ Show';
}

toggleButton.addEventListener('click', () => {
  if (!debugVisible) return;
  controlsVisible = !controlsVisible;
  if (controlsVisible) {
    controlsPanel.classList.remove('hidden');
    toggleButton.textContent = '⚙️ Controls';
  } else {
    controlsPanel.classList.add('hidden');
    toggleButton.textContent = '⚙️ Show';
  }
});

// Toggle debug display by pressing H
function toggleDebug() {
  debugVisible = !debugVisible;
  controlsPanel.classList.toggle('debug-mode', debugVisible);
  toggleButton.classList.toggle('debug-mode', debugVisible);
  if (debugVisible) {
    controlsVisible = true;
    controlsPanel.classList.remove('hidden');
    toggleButton.textContent = '⚙️ Controls';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') toggleDebug();
});

// Triple-tap anywhere on the page to toggle debug on touch devices.
let tapTimes = [];
document.addEventListener('touchend', (e) => {
  if (e.target.closest('.controls') || e.target.closest('.toggle-controls') || e.target.closest('.fullscreen-button')) return;
  const now = Date.now();
  tapTimes = tapTimes.filter(t => now - t < 600);
  tapTimes.push(now);
  if (tapTimes.length >= 3) {
    tapTimes = [];
    toggleDebug();
  }
}, { passive: true });

// Function to update CSS custom properties with ULTRA SMOOTH sine wave interpolation
function updatePulse() {
  const root = document.documentElement.style;
  const intensity = parseFloat(intensityInput.value);
  const maxSaturation = parseFloat(saturationInput.value);
  const maxHue = parseFloat(hueShiftInput.value);
  const maxScale = parseFloat(scaleInput.value);

  // Base values
  const minBrightness = Math.max(0.6, intensity - 0.4);
  const minSaturation = 0.9;
  const minHue = 0;
  const minScale = 1.0;

  // Keyframe percentages for ultra-smooth breathing
  const keyframes = [0, 3, 6, 9, 12, 15, 18, 21, 25, 29, 33, 37, 42, 46, 50, 54, 58, 63, 67, 71, 75, 79, 83, 87, 91, 94, 97, 100];

  // Heartbeat envelope: a strong "lub" (S1) followed by a softer "dub" (S2),
  // then a long diastolic rest. Modeled as two gaussian peaks plus a tiny
  // baseline tremor so the nebula keeps breathing during the rest phase.
  const lubCenter = 14;   // % of cycle
  const lubWidth = 9;
  const dubCenter = 34;
  const dubWidth = 11;
  const dubAmp = 0.6;

  keyframes.forEach(percent => {
    const lub = Math.exp(-Math.pow((percent - lubCenter) / lubWidth, 2));
    const dub = dubAmp * Math.exp(-Math.pow((percent - dubCenter) / dubWidth, 2));
    const baseline = 0.04 * (Math.sin((percent / 100) * 2 * Math.PI * 1.7) + 1) / 2;
    const finalSine = Math.max(0, Math.min(1, lub + dub + baseline));

    // Calculate smooth interpolated values
    const brightness = (minBrightness + (intensity - minBrightness) * finalSine).toFixed(3);
    const saturation = (minSaturation + (maxSaturation - minSaturation) * finalSine).toFixed(3);
    const hue = (minHue + maxHue * finalSine).toFixed(2);
    const scale = (minScale + (maxScale - minScale) * finalSine).toFixed(5);

    // Set CSS variables for each keyframe
    root.setProperty(`--brightness-${percent}`, brightness);
    root.setProperty(`--saturation-${percent}`, saturation);
    root.setProperty(`--hue-${percent}`, hue + 'deg');
    root.setProperty(`--scale-${percent}`, scale);
  });

  // Update animation duration
  nebula.style.animationDuration = speedInput.value + 's';
}

// Function to update display values
function updateDisplayValues() {
  speedValue.textContent = speedInput.value + 's';
  intensityValue.textContent = intensityInput.value;
  saturationValue.textContent = saturationInput.value;
  hueShiftValue.textContent = hueShiftInput.value + '°';
  scaleValue.textContent = scaleInput.value;
}

// Add event listeners
[speedInput, intensityInput, saturationInput, hueShiftInput, scaleInput].forEach(input => {
  input.addEventListener('input', () => {
    updateDisplayValues();
    updatePulse();
  });
});

// Initialize the controls
updateDisplayValues();
updatePulse();

// Handle fullscreen toggling when the dedicated button is present on the page
if (fullscreenButton) {
  // Update the button icon depending on whether the page is already fullscreen
  function updateFullscreenButtonText() {
    // When an element is fullscreen the API exposes it through document.fullscreenElement
    if (document.fullscreenElement) {
      fullscreenButton.innerText = '✖';
    } else {
      fullscreenButton.innerText = '⛶';
    }
  }

  // Switch between fullscreen mode and normal mode when the user clicks the button
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      // Request fullscreen on the entire document element so the nebula fills the screen
      document.documentElement.requestFullscreen().catch(error => {
        console.warn('Fullscreen request failed:', error);
      });
    } else if (document.exitFullscreen) {
      // Exit fullscreen to return to the normal browser window layout
      document.exitFullscreen();
    }
  }

  fullscreenButton.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenButtonText);
  updateFullscreenButtonText();

  // Desktop affordances: press F or double-click anywhere outside the controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  });
  document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.controls') || e.target.closest('.toggle-controls')) return;
    toggleFullscreen();
  });
}
