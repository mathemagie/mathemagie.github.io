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

    this.regionStations = {
      'Ocean': { name: 'SomaFM Mission Control', url: 'https://ice2.somafm.com/missioncontrol-128-mp3' },
      'North America': { name: 'KEXP 90.3 Seattle', url: 'https://kexp.streamguys1.com/kexp128.mp3' },
      'South America': { name: 'Radio Paradise World', url: 'https://stream.radioparadise.com/world-128' },
      'Europe': { name: 'Radio Swiss Pop', url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128' },
      'Africa': { name: 'RFI Monde', url: 'https://rfimonde64k.ice.infomaniak.ch/rfimonde-64.mp3' },
      'Asia': { name: 'SomaFM Groove Salad', url: 'https://ice2.somafm.com/groovesalad-128-mp3' },
      'Oceania': { name: 'SomaFM Space Station Soma', url: 'https://ice2.somafm.com/spacestation-128-mp3' }
    };
  }

  init() {
    // Wire radio UI elements
    this.radioPlayer = document.getElementById('radio-player');
    this.stationLabel = document.getElementById('station-label');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.playBtn = document.getElementById('play-btn');
    this.timeDisplay = document.getElementById('time-display');
    this.progressBar = document.getElementById('progress-bar');

    this.setupEventListeners();
    this.setStationForRegion('Ocean'); // Initial default
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
      this.radioPlayer.addEventListener('timeupdate', () => this.updateProgress());
      this.radioPlayer.addEventListener('loadstart', () => {
        this.timeDisplay.textContent = '0:00 / 0:00';
        this.progressBar.style.width = '0%';
      });
      this.radioPlayer.addEventListener('play', () => {
        this.isPlaying = true;
        this.playBtn.textContent = '⏸';
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

  getRegion(lat, lon) {
    // Rough continent bounding boxes; fall back to Ocean
    if (lat >= 10 && lat <= 85 && lon >= -168 && lon <= -52) {return 'North America';}
    if (lat >= -56 && lat <= 12 && lon >= -82 && lon <= -34) {return 'South America';}
    if (lat >= 36 && lat <= 72 && lon >= -10 && lon <= 40) {return 'Europe';}
    if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 51) {return 'Africa';}
    if (lat >= 5 && lat <= 77 && lon >= 26 && lon <= 180) {return 'Asia';}
    if (lat >= -50 && lat <= -10 && lon >= 112 && lon <= 154) {return 'Oceania';}
    return 'Ocean';
  }

  setStationForRegion(region) {
    const station = this.regionStations[region] || this.regionStations['Ocean'];
    if (!this.radioPlayer || !station) {return;}
    const wasPlaying = this.radioPlayer && !this.radioPlayer.paused && !this.radioPlayer.ended;
    const newSrc = station.url;
    const currentSrc = this.radioPlayer.currentSrc || this.radioPlayer.src;
    const isDifferent = !currentSrc || !currentSrc.includes(newSrc);
    // Update label regardless
    this.stationLabel.textContent = `${station.name} — ${region}`;
    if (!isDifferent) {return;}
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
    }
  }

  toggleMute() {
    if (!this.radioPlayer) {return;}

    this.radioPlayer.muted = !this.radioPlayer.muted;
    // Volume button removed from UI
  }

  updateProgress() {
    if (!this.radioPlayer || !this.timeDisplay || !this.progressBar) {return;}

    // For live streams, we'll show a simulated progress for visual feedback
    const currentTime = this.radioPlayer.currentTime || 0;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Since most radio streams are live, we'll show current time / live
    this.timeDisplay.textContent = `${timeString} / Live`;

    // Simulate progress for live streams (cycling animation)
    if (this.isPlaying) {
      const progress = ((Date.now() / 1000) % 30) / 30 * 100; // 30-second cycle
      this.progressBar.style.width = `${progress}%`;
    }
  }

  // Fullscreen helpers
  isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  updateFullscreenUI() {
    const active = this.isFullscreen();
    if (this.fullscreenBtn) {
      this.fullscreenBtn.textContent = active ? 'Exit Fullscreen' : 'Enter Fullscreen';
      this.fullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  enterFullscreen() {
    const root = document.documentElement;
    if (root.requestFullscreen) {return root.requestFullscreen();}
    if (root.webkitRequestFullscreen) {return root.webkitRequestFullscreen();}
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