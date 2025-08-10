/* eslint-env browser */
// Radio functionality for ISS Radio application
class RadioManager {
  constructor() {
    this.radioPlayer = null;
    this.stationLabel = null;
    this.fullscreenBtn = null;
    this.playBtn = null;
    this.timeDisplay = null;
    this.progressBar = null;
    this.currentRegion = null;
    this.isPlaying = false;
    this.audioContext = null;
    this.mediaSource = null;
    this.analyser = null;
    this.level = 0;
    this.levelSmoothed = 0;

    this.regionStations = {
      // Americas (6 regions)
      'US West': { name: 'SomaFM Left Coast 70s', url: 'https://ice4.somafm.com/seventies-128-mp3' },
      'US East': { name: 'SomaFM Indie Pop Rocks', url: 'https://ice2.somafm.com/indiepop-128-mp3' },
      'Canada': { name: 'SomaFM Folk Forward', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
      'Mexico/Central America': { name: 'SomaFM Sonic Universe', url: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
      'Brazil': { name: 'SomaFM Bossa Beyond', url: 'https://ice2.somafm.com/bossa-128-mp3' },
      'Argentina/Chile': { name: 'SomaFM ThistleRadio', url: 'https://ice1.somafm.com/thistle-128-mp3' },

      // Europe (4 regions)
      'Western Europe': { name: 'SomaFM PopTron', url: 'https://ice2.somafm.com/poptron-128-mp3' },
      'Northern Europe': { name: 'SomaFM Deep Space One', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
      'Eastern Europe': { name: 'SomaFM Underground 80s', url: 'https://ice4.somafm.com/u80s-128-mp3' },
      'Mediterranean': { name: 'Radio Swiss Pop', url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128' },

      // Asia (4 regions)
      'East Asia': { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
      'Southeast Asia': { name: 'SomaFM Groove Salad', url: 'https://ice2.somafm.com/groovesalad-128-mp3' },
      'South Asia': { name: 'SomaFM Beat Blender', url: 'https://ice1.somafm.com/beatblender-128-mp3' },
      'Middle East': { name: 'SomaFM Digitalis', url: 'https://ice2.somafm.com/digitalis-128-mp3' },

      // Africa (2 regions)
      'North Africa': { name: 'SomaFM Doomed', url: 'https://ice4.somafm.com/doomed-128-mp3' },
      'Sub-Saharan Africa': { name: 'SomaFM Seven Inch Soul', url: 'https://ice1.somafm.com/7soul-128-mp3' },

      // Oceania/Pacific (2 regions)
      'Australia': { name: 'SomaFM Suburbs of Goa', url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3' },
      'Pacific Islands': { name: 'SomaFM Illinois Street Lounge', url: 'https://ice1.somafm.com/illstreet-128-mp3' },

      // Polar/Ocean (2 regions)
      'Arctic': { name: 'SomaFM Fluid', url: 'https://ice1.somafm.com/fluid-128-mp3' },
      'Ocean': { name: 'SomaFM Mission Control', url: 'https://ice2.somafm.com/missioncontrol-128-mp3' }
    };
  }

  init() {
    // Wire radio UI elements
    this.radioPlayer = document.getElementById('radio-player');
    if (this.radioPlayer) {
      // Attempt to allow WebAudio analysis on CORS-enabled streams
      this.radioPlayer.crossOrigin = 'anonymous';
    }
    this.stationLabel = document.getElementById('station-label');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.playBtn = document.getElementById('play-btn');
    this.radioHint = document.querySelector('.radio-hint');

    this.setupEventListeners();
    this.setStationForRegion('Ocean'); // Initial default

    // Expose for particles to read current audio level
    window.radioManager = this;
  }

  setupEventListeners() {
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
      this.updateFullscreenUI();
    }

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlayback());
    }


    if (this.radioPlayer) {
      // Lazily create audio analyser on first play to respect autoplay policies
      const ensureAnalyser = () => {
        try {
          if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
          if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
          }
          if (!this.mediaSource && this.audioContext) {
            this.mediaSource = this.audioContext.createMediaElementSource(this.radioPlayer);
          }
          if (!this.analyser && this.audioContext) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256; // small, low cost
            this.analyser.smoothingTimeConstant = 0.85;
            const gain = this.audioContext.createGain();
            // Keep gain ~0 to avoid double audio in browsers that already play element directly
            gain.gain.value = 0.00001;
            // Route: element -> analyser -> (near-silent) gain -> destination
            this.mediaSource.connect(this.analyser);
            this.analyser.connect(gain);
            gain.connect(this.audioContext.destination);
            this.startLevelPolling();
          }
        } catch {
          // Fallback silently if WebAudio is unavailable
        }
      };
      this.radioPlayer.addEventListener('play', () => {
        this.isPlaying = true;
        this.playBtn.textContent = '⏸';
        ensureAnalyser();
      });
      this.radioPlayer.addEventListener('pause', () => {
        this.isPlaying = false;
        this.playBtn.textContent = '▶';
      });
      this.radioPlayer.addEventListener('ended', () => {
        this.isPlaying = false;
        this.playBtn.textContent = '▶';
      });
    }

    // Fullscreen change events
    document.addEventListener('fullscreenchange', () => {
      this.updateFullscreenUI();
    });
    document.addEventListener('webkitfullscreenchange', () => {
      this.updateFullscreenUI();
    });
  }

  startLevelPolling() {
    if (!this.analyser) {return;}
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      if (!this.analyser) {return;}
      this.analyser.getByteFrequencyData(buffer);
      // Use low-mid band for smoother motion
      let sum = 0;
      let count = 0;
      for (let i = 2; i < Math.min(24, buffer.length); i++) {
        sum += buffer[i];
        count++;
      }
      const avg = count > 0 ? sum / (count * 255) : 0; // 0..1
      this.level = avg;
      // Smooth aggressively to keep subtle
      this.levelSmoothed = this.levelSmoothed * 0.9 + this.level * 0.1;
      // Expose a clamped, subtle amplitude for visuals
      this.visualLevel = Math.min(0.25, Math.max(0, this.levelSmoothed));
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }

  getRegion(lat, lon) {
    // ISS orbital coverage: ±51.6° latitude limit

    // Americas (6 regions)
    if (lat >= 32 && lat <= 49 && lon >= -125 && lon <= -114) {return 'US West';} // California, Oregon, Washington
    if (lat >= 25 && lat <= 41 && lon >= -85 && lon <= -67) {return 'US East';} // East Coast US
    if (lat >= 42 && lat <= 51.6 && lon >= -141 && lon <= -52) {return 'Canada';} // Canada
    if (lat >= 14 && lat <= 32 && lon >= -118 && lon <= -77) {return 'Mexico/Central America';} // Mexico to Panama
    if (lat >= -24 && lat <= 5 && lon >= -75 && lon <= -30) {return 'Brazil';} // Brazil
    if (lat >= -51.6 && lat <= -24 && lon >= -75 && lon <= -47) {return 'Argentina/Chile';} // Southern South America

    // Europe (4 regions)
    if (lat >= 50 && lat <= 51.6 && lon >= -10 && lon <= 8) {return 'Western Europe';} // UK, Ireland, France
    if (lat >= 55 && lat <= 70 && lon >= 4 && lon <= 31) {return 'Northern Europe';} // Scandinavia, Baltic
    if (lat >= 44 && lat <= 51.6 && lon >= 9 && lon <= 50) {return 'Eastern Europe';} // Eastern Europe
    if (lat >= 36 && lat <= 47 && lon >= -10 && lon <= 45) {return 'Mediterranean';} // Mediterranean Basin

    // Asia (4 regions)
    if (lat >= 24 && lat <= 46 && lon >= 121 && lon <= 146) {return 'East Asia';} // Japan, Korea, East China
    if (lat >= -11 && lat <= 24 && lon >= 95 && lon <= 141) {return 'Southeast Asia';} // SE Asia
    if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) {return 'South Asia';} // India, Pakistan, Bangladesh
    if (lat >= 12 && lat <= 42 && lon >= 35 && lon <= 63) {return 'Middle East';} // Middle East

    // Africa (2 regions)
    if (lat >= 20 && lat <= 37 && lon >= -18 && lon <= 52) {return 'North Africa';} // North Africa
    if (lat >= -35 && lat <= 17 && lon >= -18 && lon <= 52) {return 'Sub-Saharan Africa';} // Sub-Saharan Africa

    // Oceania/Pacific (2 regions)
    if (lat >= -44 && lat <= -10 && lon >= 113 && lon <= 154) {return 'Australia';} // Australia
    if (lat >= -37 && lat <= -9 && (lon >= 160 || lon <= -140)) {return 'Pacific Islands';} // Pacific Islands

    // Polar/Ocean (2 regions)
    if (lat >= 66 || (lat >= 60 && lon >= -170 && lon <= -52)) {return 'Arctic';} // Arctic regions

    // Default fallback
    return 'Ocean';
  }

  setStationForRegion(region) {
    const station = this.regionStations[region] || this.regionStations['Ocean'];
    if (!this.radioPlayer || !station) {return;}
    const wasPlaying = this.radioPlayer && !this.radioPlayer.paused && !this.radioPlayer.ended;
    const newSrc = station.url;
    const currentSrc = this.radioPlayer.currentSrc || this.radioPlayer.src;
    const isDifferent = !currentSrc || !currentSrc.includes(newSrc);
    // Update label with compact format
    this.stationLabel.textContent = `${station.name} • ${region}`;
    if (!isDifferent) {return;}
    // Ensure crossOrigin stays set before changing src
    this.radioPlayer.crossOrigin = 'anonymous';
    this.radioPlayer.src = newSrc;
    this.radioPlayer.dataset.station = station.name;
    if (wasPlaying) {
      this.radioPlayer.play().catch(() => {
        /* Autoplay blocked or user paused */
        this.isPlaying = false;
        if (this.playBtn) {this.playBtn.textContent = '▶';}
      });
    }
  }

  updateRadioForLocation(lat, lon) {
    const region = this.getRegion(lat, lon);
    if (region !== this.currentRegion) {
      this.currentRegion = region;
      this.setStationForRegion(region);
    }
  }

  // Audio control functions
  togglePlayback() {
    if (!this.radioPlayer) {return;}

    if (this.isPlaying) {
      this.radioPlayer.pause();
    } else {
      this.radioPlayer.play().catch(() => {
        console.log('Autoplay blocked - user interaction required');
      });

      // Fade out the radio hint after 2 seconds when play is clicked
      if (this.radioHint && !this.radioHint.classList.contains('fade-out')) {
        setTimeout(() => {
          this.radioHint.classList.add('fade-out');
          // Remove the element completely after fade-out animation (0.8s) completes
          setTimeout(() => {
            if (this.radioHint && this.radioHint.parentNode) {
              this.radioHint.parentNode.removeChild(this.radioHint);
              this.radioHint = null;
            }
          }, 800);
        }, 2000);
      }
    }
  }

  toggleMute() {
    if (!this.radioPlayer) {return;}

    this.radioPlayer.muted = !this.radioPlayer.muted;
    // Volume button removed from UI
  }


  // Fullscreen helpers
  isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  updateFullscreenUI() {
    const active = this.isFullscreen();
    if (this.fullscreenBtn) {
      this.fullscreenBtn.textContent = '⛶';
      this.fullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  enterFullscreen() {
    const root = document.documentElement;
    // Prefer Element fullscreen APIs
    if (root.requestFullscreen) {return root.requestFullscreen();}
    if (root.webkitRequestFullscreen) {return root.webkitRequestFullscreen();}
    // iOS Safari does not support requestFullscreen reliably in page context
    // As a fallback, prompt Add to Home Screen PWA for true fullscreen experience.
    return Promise.resolve();
  }

  exitFullscreen() {
    if (document.exitFullscreen) {return document.exitFullscreen();}
    if (document.webkitExitFullscreen) {return document.webkitExitFullscreen();}
    return Promise.resolve();
  }

  toggleFullscreen() {
    if (this.isFullscreen()) {
      this.exitFullscreen().then(() => {
        // Delay to allow DOM to update before resize
        window.setTimeout(() => {
          if (window.geographyManager) {
            window.geographyManager.repositionParticlesAfterResize();
          }
        }, 100);
      }).catch(() => {});
    } else {
      this.enterFullscreen().then(() => {
        // Delay to allow DOM to update before resize
        window.setTimeout(() => {
          if (window.geographyManager) {
            window.geographyManager.repositionParticlesAfterResize();
          }
        }, 100);
      }).catch(() => {});
    }
  }
}

// Export for use in main application
window.RadioManager = RadioManager;