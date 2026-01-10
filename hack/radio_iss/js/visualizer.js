/* eslint-env browser */
/* global localStorage, performance */

// Audio Visualizer for 25544.fm (ISS Orbital Radio)
// Uses Web Audio API to analyze radio stream and create visual effects

class AudioVisualizer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.frequencyData = null;
    this.timeDomainData = null;
    this.isEnabled = false;
    this.isConnected = false;
    this.currentAudioElement = null;

    // Visualization parameters
    this.fftSize = 256; // Results in 128 frequency bins
    this.smoothingTimeConstant = 0.8;

    // Beat detection state
    this.beatThreshold = 0.15;
    this.beatCooldown = 0;
    this.beatCooldownMax = 10; // Frames to wait between beats
    this.lastBeatTime = 0;
    this.isBeat = false;
    this.beatIntensity = 0;

    // Audio level tracking
    this.currentLevel = 0;
    this.peakLevel = 0;
    this.averageLevel = 0;

    // Spectrum data for visualization
    this.bassLevel = 0;
    this.midLevel = 0;
    this.highLevel = 0;

    // Load preference from localStorage
    const savedPref = localStorage.getItem('audioVisualizerEnabled');
    this.isEnabled = savedPref === 'true';
  }

  init() {
    // Create toggle button in UI if not already present
    this.createToggleButton();

    // Apply saved preference
    if (this.isEnabled) {
      this.updateToggleUI(true);
    }
  }

  createToggleButton() {
    // Find the ISS context controls section
    const controlsSection = document.querySelector('.iss-context-controls');
    if (!controlsSection) {return;}

    // Check if button already exists
    if (document.getElementById('visualizer-toggle')) {return;}

    // Create the toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'visualizer-toggle';
    toggleBtn.className = 'iss-context-toggle';
    toggleBtn.type = 'button';
    toggleBtn.textContent = `Audio Viz: ${this.isEnabled ? 'ON' : 'OFF'}`;
    toggleBtn.style.marginTop = '8px';

    if (this.isEnabled) {
      toggleBtn.classList.add('active');
    }

    toggleBtn.addEventListener('click', () => this.toggle());

    controlsSection.appendChild(toggleBtn);
    this.toggleButton = toggleBtn;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('audioVisualizerEnabled', this.isEnabled.toString());

    this.updateToggleUI(this.isEnabled);

    if (this.isEnabled) {
      // Try to connect to current audio
      this.tryConnect();
    } else {
      // Disconnect and reset visual state
      this.disconnect();
    }
  }

  updateToggleUI(enabled) {
    if (this.toggleButton) {
      this.toggleButton.textContent = `Audio Viz: ${enabled ? 'ON' : 'OFF'}`;
      if (enabled) {
        this.toggleButton.classList.add('active');
      } else {
        this.toggleButton.classList.remove('active');
      }
    }
  }

  tryConnect() {
    // Find the active radio player
    const radioManager = window.radioManager;
    if (!radioManager) {return false;}

    const activePlayer = radioManager.activePlayer === 'A'
      ? radioManager.radioPlayer
      : radioManager.radioPlayerB;

    if (activePlayer && !activePlayer.paused) {
      return this.connectToAudio(activePlayer);
    }

    return false;
  }

  connectToAudio(audioElement) {
    if (!this.isEnabled) {return false;}
    if (!audioElement) {return false;}

    // Don't reconnect to the same element
    if (this.currentAudioElement === audioElement && this.isConnected) {
      return true;
    }

    try {
      // Create audio context if needed (must be created after user gesture)
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create analyser node
      if (!this.analyser) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.fftSize;
        this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;

        // Create data arrays
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
      }

      // Check if this audio element already has a source
      if (!audioElement._visualizerSource) {
        // Create media element source
        const source = this.audioContext.createMediaElementSource(audioElement);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Store source on audio element to prevent double-connection
        audioElement._visualizerSource = source;
      }

      this.currentAudioElement = audioElement;
      this.isConnected = true;

      return true;
    } catch (e) {
      console.warn('AudioVisualizer: Could not connect to audio:', e.message);
      this.isConnected = false;
      return false;
    }
  }

  disconnect() {
    this.isConnected = false;
    this.resetLevels();
  }

  resetLevels() {
    this.currentLevel = 0;
    this.peakLevel = 0;
    this.averageLevel = 0;
    this.bassLevel = 0;
    this.midLevel = 0;
    this.highLevel = 0;
    this.isBeat = false;
    this.beatIntensity = 0;
  }

  update() {
    if (!this.isEnabled || !this.isConnected || !this.analyser) {
      this.resetLevels();
      return;
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);

    // Calculate overall level
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
    }
    this.currentLevel = sum / (this.frequencyData.length * 255);

    // Update peak with decay
    if (this.currentLevel > this.peakLevel) {
      this.peakLevel = this.currentLevel;
    } else {
      this.peakLevel *= 0.995; // Slow decay
    }

    // Update average with smoothing
    this.averageLevel = this.averageLevel * 0.95 + this.currentLevel * 0.05;

    // Calculate frequency bands (bass, mid, high)
    const binCount = this.frequencyData.length;
    const bassEnd = Math.floor(binCount * 0.1);  // 0-10% = bass
    const midEnd = Math.floor(binCount * 0.5);   // 10-50% = mids
    // 50-100% = highs

    let bassSum = 0, midSum = 0, highSum = 0;

    for (let i = 0; i < binCount; i++) {
      const value = this.frequencyData[i] / 255;
      if (i < bassEnd) {
        bassSum += value;
      } else if (i < midEnd) {
        midSum += value;
      } else {
        highSum += value;
      }
    }

    this.bassLevel = bassSum / bassEnd;
    this.midLevel = midSum / (midEnd - bassEnd);
    this.highLevel = highSum / (binCount - midEnd);

    // Beat detection based on bass energy
    this.detectBeat();
  }

  detectBeat() {
    // Decay beat intensity
    this.beatIntensity *= 0.85;

    if (this.beatCooldown > 0) {
      this.beatCooldown--;
      this.isBeat = false;
      return;
    }

    // Detect beat when bass exceeds threshold and is higher than average
    const beatTrigger = this.bassLevel > this.beatThreshold &&
                        this.bassLevel > this.averageLevel * 1.5;

    if (beatTrigger) {
      this.isBeat = true;
      this.beatIntensity = Math.min(1, this.bassLevel * 2);
      this.beatCooldown = this.beatCooldownMax;
      this.lastBeatTime = performance.now();
    } else {
      this.isBeat = false;
    }
  }

  // Get spectrum data for external visualization
  getSpectrum(numBands) {
    if (!this.isConnected || !this.frequencyData) {
      return new Array(numBands).fill(0);
    }

    const spectrum = [];
    const binCount = this.frequencyData.length;
    const binsPerBand = Math.floor(binCount / numBands);

    for (let i = 0; i < numBands; i++) {
      let sum = 0;
      const start = i * binsPerBand;
      const end = start + binsPerBand;

      for (let j = start; j < end && j < binCount; j++) {
        sum += this.frequencyData[j];
      }

      spectrum.push(sum / (binsPerBand * 255));
    }

    return spectrum;
  }

  // Get normalized waveform data
  getWaveform(numSamples) {
    if (!this.isConnected || !this.timeDomainData) {
      return new Array(numSamples).fill(0.5);
    }

    const waveform = [];
    const step = Math.floor(this.timeDomainData.length / numSamples);

    for (let i = 0; i < numSamples; i++) {
      waveform.push(this.timeDomainData[i * step] / 255);
    }

    return waveform;
  }

  // Check if visualizer is active and has audio data
  isActive() {
    return this.isEnabled && this.isConnected && this.currentLevel > 0.01;
  }
}

// Export for use in main application
window.AudioVisualizer = AudioVisualizer;
