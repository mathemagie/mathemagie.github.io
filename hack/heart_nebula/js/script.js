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
if (debugMode) {
  controlsPanel.classList.add('debug-mode');
  toggleButton.classList.add('debug-mode');
}

// Toggle controls visibility (only works in debug mode)
let controlsVisible = true;

if (debugMode) {
  toggleButton.addEventListener('click', () => {
    controlsVisible = !controlsVisible;
    if (controlsVisible) {
      controlsPanel.classList.remove('hidden');
      toggleButton.textContent = '⚙️ Controls';
    } else {
      controlsPanel.classList.add('hidden');
      toggleButton.textContent = '⚙️ Show';
    }
  });
}

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

  keyframes.forEach(percent => {
    // Convert percentage to radians for sine wave calculation (0 to 2π)
    const angle = (percent / 100) * 2 * Math.PI;

    // Sine wave calculation for natural breathing pattern
    const sineValue = (Math.sin(angle - Math.PI/2) + 1) / 2; // Normalized 0-1

    // Add micro-variations for realism (±2% random fluctuation)
    const microVariation = 1 + (Math.sin(angle * 7.3) * 0.02);
    const finalSine = Math.max(0, Math.min(1, sineValue * microVariation));

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
}
