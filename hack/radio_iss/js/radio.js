/* eslint-env browser */
/* global localStorage, performance, requestAnimationFrame */

// Radio functionality for 25544.fm (ISS Orbital Radio)
class RadioManager {
  constructor() {
    this.radioPlayer = null;
    this.radioPlayerB = null; // Second audio element for crossfade
    this.activePlayer = 'A'; // Track which player is currently active
    this.stationLabel = null;
    this.fullscreenBtn = null;
    this.playBtn = null;
    this.timeDisplay = null;
    this.progressBar = null;
    this.currentRegion = null;
    this.isPlaying = false;
    this.crossfadeDuration = 400; // 400ms crossfade duration

    // ISS Context overlay properties
    this.issContextOverlay = null;
    this.issLatLonElement = null;
    this.issCurrentRegionElement = null;
    this.issNextEtaElement = null;
    this.pathTraceToggle = null;
    this.isIssContextVisible = false;
    this.pathTraceEnabled = false;
    this.lastIssPosition = { lat: 0, lon: 0 };
    this.nextRegionEta = null;

    this.regionStations = {
      // Americas (6 regions)
      'US West': [
        { name: 'KEXP Seattle', url: 'https://kexp.streamguys1.com/kexp160.aac' },
        { name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
        { name: 'SomaFM Secret Agent', url: 'https://ice1.somafm.com/secretagent-128-mp3' }
      ],
      'US East': [
        { name: 'WFMU New Jersey', url: 'https://stream0.wfmu.org/freeform-128k' },
        { name: 'SomaFM Indie Pop Rocks', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
        { name: 'SomaFM Left Coast 70s', url: 'https://ice1.somafm.com/seventies-128-mp3' }
      ],
      'Canada': [
        { name: 'SomaFM Folk Forward', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
        { name: 'SomaFM Covers', url: 'https://ice1.somafm.com/covers-128-mp3' },
        { name: 'SomaFM Boot Liquor', url: 'https://ice1.somafm.com/bootliquor-128-mp3' }
      ],
      'Mexico/Central America': [
        { name: 'SomaFM Sonic Universe', url: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
        { name: 'SomaFM Fluid', url: 'https://ice1.somafm.com/fluid-128-mp3' },
        { name: 'SomaFM Lush', url: 'https://ice1.somafm.com/lush-128-mp3' }
      ],
      'Brazil': [
        { name: 'SomaFM Bossa Beyond', url: 'https://ice2.somafm.com/bossa-128-mp3' },
        { name: 'SomaFM Groove Salad Classic', url: 'https://ice1.somafm.com/gsclassic-128-mp3' },
        { name: 'SomaFM PopTron', url: 'https://ice1.somafm.com/poptron-128-mp3' }
      ],
      'Argentina/Chile': [
        { name: 'SomaFM ThistleRadio', url: 'https://ice1.somafm.com/thistle-128-mp3' },
        { name: 'SomaFM Metal Detector', url: 'https://ice1.somafm.com/metal-128-mp3' },
        { name: 'SomaFM Synphaera', url: 'https://ice1.somafm.com/synphaera-128-mp3' }
      ],

      // Europe (4 regions)
      'Western Europe': [
        { name: 'FIP Paris', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
        { name: 'FIP Rock', url: 'https://icecast.radiofrance.fr/fiprock-midfi.mp3' },
        { name: 'FIP Jazz', url: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3' },
        { name: 'FIP Electro', url: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3' }
      ],
      'Northern Europe': [
        { name: 'SomaFM Deep Space One', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
        { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
        { name: 'SomaFM Space Station', url: 'https://ice1.somafm.com/spacestation-128-mp3' }
      ],
      'Eastern Europe': [
        { name: 'SomaFM Underground 80s', url: 'https://ice4.somafm.com/u80s-128-mp3' },
        { name: 'SomaFM DEF CON Radio', url: 'https://ice1.somafm.com/defcon-128-mp3' },
        { name: 'SomaFM Cliqhop IDM', url: 'https://ice1.somafm.com/cliqhop-128-mp3' }
      ],
      'Mediterranean': [
        { name: 'Radio Swiss Pop', url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128' },
        { name: 'Radio Swiss Jazz', url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128' },
        { name: 'Radio Swiss Classic', url: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128' }
      ],

      // Asia (4 regions)
      'East Asia': [
        { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
        { name: 'SomaFM Mission Control', url: 'https://ice1.somafm.com/missioncontrol-128-mp3' },
        { name: 'SomaFM n5MD Radio', url: 'https://ice1.somafm.com/n5md-128-mp3' }
      ],
      'Southeast Asia': [
        { name: 'SomaFM Suburbs of Goa', url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3' },
        { name: 'SomaFM Dub Step Beyond', url: 'https://ice1.somafm.com/dubstep-128-mp3' },
        { name: 'SomaFM The Trip', url: 'https://ice1.somafm.com/thetrip-128-mp3' }
      ],
      'South Asia': [
        { name: 'SomaFM Beat Blender', url: 'https://ice1.somafm.com/beatblender-128-mp3' },
        { name: 'SomaFM Digitalis', url: 'https://ice2.somafm.com/digitalis-128-mp3' },
        { name: 'SomaFM SF 10-33', url: 'https://ice1.somafm.com/sf1033-128-mp3' }
      ],
      'Middle East': [
        { name: 'SomaFM Digitalis', url: 'https://ice2.somafm.com/digitalis-128-mp3' },
        { name: 'SomaFM BAGeL Radio', url: 'https://ice1.somafm.com/bagel-128-mp3' },
        { name: 'SomaFM Specials', url: 'https://ice1.somafm.com/specials-128-mp3' }
      ],

      // Africa (2 regions)
      'North Africa': [
        { name: 'SomaFM Doomed', url: 'https://ice4.somafm.com/doomed-128-mp3' },
        { name: 'SomaFM Black Rock FM', url: 'https://ice1.somafm.com/brfm-128-mp3' },
        { name: 'SomaFM Vaporwaves', url: 'https://ice1.somafm.com/vaporwaves-128-mp3' }
      ],
      'Sub-Saharan Africa': [
        { name: 'SomaFM Seven Inch Soul', url: 'https://ice1.somafm.com/7soul-128-mp3' },
        { name: 'SomaFM SomaFM Live', url: 'https://ice1.somafm.com/live-128-mp3' },
        { name: 'SomaFM Reggae', url: 'https://ice1.somafm.com/reggae-128-mp3' }
      ],

      // Oceania/Pacific (2 regions)
      'Australia': [
        { name: 'Triple J Australia', url: 'https://live-radio02.mediahubaustralia.com/2TJW/mp3/' },
        { name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
        { name: 'SomaFM Secret Agent', url: 'https://ice1.somafm.com/secretagent-128-mp3' }
      ],
      'Pacific Islands': [
        { name: 'SomaFM Illinois Street Lounge', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
        { name: 'SomaFM Tiki Time', url: 'https://ice1.somafm.com/tikitime-128-mp3' },
        { name: 'SomaFM Xmas in Frisko', url: 'https://ice1.somafm.com/xmasinfrisko-128-mp3' }
      ],

      // Polar/Ocean (2 regions)
      'Arctic': [
        { name: 'SomaFM Deep Space One', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
        { name: 'SomaFM Space Station', url: 'https://ice1.somafm.com/spacestation-128-mp3' },
        { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' }
      ],
      'Ocean': [
        { name: 'Radio Paradise', url: 'https://stream.radioparadise.com/aac-320' },
        { name: 'Radio Paradise Mellow', url: 'https://stream.radioparadise.com/mellow-320' },
        { name: 'Radio Paradise Rock', url: 'https://stream.radioparadise.com/rock-320' },
        { name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3' }
      ]
    };
  }

  init() {
    // Wire radio UI elements
    this.radioPlayer = document.getElementById('radio-player');
    this.radioPlayerB = document.getElementById('radio-player-b');
    this.stationLabel = document.getElementById('station-label');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.playBtn = document.getElementById('play-btn');
    this.radioHint = document.querySelector('.radio-hint');

    // Wire ISS context overlay elements
    this.issContextOverlay = document.getElementById('iss-context-overlay');
    this.issLatLonElement = document.getElementById('iss-lat-lon');
    this.issCurrentRegionElement = document.getElementById('iss-current-region');
    this.issNextEtaElement = document.getElementById('iss-next-eta');
    this.pathTraceToggle = document.getElementById('path-trace-toggle');

    this.setupEventListeners();
    this.setStationForRegion('Ocean'); // Initial default

    // Load ISS context visibility preference from localStorage
    const issContextPref = localStorage.getItem('issContextVisible');
    if (issContextPref === 'true') {
      this.showIssContext();
    }

    // Load path trace preference from localStorage
    const pathTracePref = localStorage.getItem('pathTraceEnabled');
    if (pathTracePref === 'true') {
      this.pathTraceEnabled = true;
      if (this.pathTraceToggle) {
        this.pathTraceToggle.textContent = 'Path Trace: ON';
        this.pathTraceToggle.classList.add('active');
      }
    }
  }

  setupEventListeners() {
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
      this.updateFullscreenUI();
    }

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlayback());
    }

    // ISS Context overlay event listeners
    if (this.issContextOverlay) {
      const closeBtn = this.issContextOverlay.querySelector('.iss-context-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideIssContext());
      }

      // Close overlay when clicking outside
      this.issContextOverlay.addEventListener('click', (e) => {
        if (e.target === this.issContextOverlay) {
          this.hideIssContext();
        }
      });
    }

    if (this.pathTraceToggle) {
      this.pathTraceToggle.addEventListener('click', () => this.togglePathTrace());
    }

    if (this.radioPlayer) {
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

    // Setup second audio player events
    if (this.radioPlayerB) {
      this.radioPlayerB.addEventListener('play', () => {
        this.isPlaying = true;
        this.playBtn.textContent = '⏸';
      });
      this.radioPlayerB.addEventListener('pause', () => {
        this.isPlaying = false;
        this.playBtn.textContent = '▶';
      });
      this.radioPlayerB.addEventListener('ended', () => {
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

  getRandomStation(region) {
    const stations = this.regionStations[region] || this.regionStations['Ocean'];
    if (!stations || stations.length === 0) {return null;}
    const randomIndex = Math.floor(Math.random() * stations.length);
    return stations[randomIndex];
  }

  setStationForRegion(region) {
    const station = this.getRandomStation(region);
    if (!this.radioPlayer || !station) {return;}

    const currentPlayer = this.activePlayer === 'A' ? this.radioPlayer : this.radioPlayerB;
    const wasPlaying = currentPlayer && !currentPlayer.paused && !currentPlayer.ended;
    const newSrc = station.url;
    const currentSrc = currentPlayer.currentSrc || currentPlayer.src;
    const isDifferent = !currentSrc || !currentSrc.includes(newSrc);

    // Update label with compact format
    this.stationLabel.textContent = `Over ${region} • ${station.name}`;
    if (!isDifferent) {return;}

    if (wasPlaying && this.radioPlayerB) {
      // Crossfade to new station
      this.crossfadeToStation(station);
    } else {
      // Instant switch for first load or when paused
      currentPlayer.src = newSrc;
      currentPlayer.dataset.station = station.name;
      if (wasPlaying) {
        currentPlayer.play().catch(() => {
          /* Autoplay blocked or user paused */
          this.isPlaying = false;
          if (this.playBtn) {this.playBtn.textContent = '▶';}
        });
      }
    }
  }

  updateRadioForLocation(lat, lon) {
    const region = this.getRegion(lat, lon);
    if (region !== this.currentRegion) {
      this.currentRegion = region;
      this.setStationForRegion(region);
    }

    // Update ISS context overlay data
    this.lastIssPosition.lat = lat;
    this.lastIssPosition.lon = lon;
    this.updateIssContextData();
    this.calculateNextRegionEta();
  }

  // Crossfade between stations
  crossfadeToStation(station) {
    const currentPlayer = this.activePlayer === 'A' ? this.radioPlayer : this.radioPlayerB;
    const nextPlayer = this.activePlayer === 'A' ? this.radioPlayerB : this.radioPlayer;

    if (!nextPlayer) {
      // Fallback to instant switch if second player not available
      this.instantSwitchToStation(currentPlayer, station);
      return;
    }

    // Set up the new station on the inactive player
    nextPlayer.src = station.url;
    nextPlayer.dataset.station = station.name;
    nextPlayer.volume = 0;

    // Start playing the new station
    nextPlayer.play().then(() => {
      // Begin crossfade
      this.performCrossfade(currentPlayer, nextPlayer);
    }).catch(() => {
      // Fallback to instant switch if new station fails to load
      this.instantSwitchToStation(currentPlayer, station);
    });
  }

  performCrossfade(fromPlayer, toPlayer) {
    const startTime = performance.now();
    const fadeOut = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / this.crossfadeDuration, 1);

      fromPlayer.volume = Math.max(0, 1 - progress);
      toPlayer.volume = Math.min(1, progress);

      if (progress < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        // Crossfade complete
        fromPlayer.pause();
        fromPlayer.volume = 1; // Reset for next use
        this.activePlayer = this.activePlayer === 'A' ? 'B' : 'A';
      }
    };
    requestAnimationFrame(fadeOut);
  }

  instantSwitchToStation(player, station) {
    player.src = station.url;
    player.dataset.station = station.name;
    if (this.isPlaying) {
      player.play().catch(() => {
        this.isPlaying = false;
        if (this.playBtn) {this.playBtn.textContent = '▶';}
      });
    }
  }

  // Audio control functions
  togglePlayback() {
    const currentPlayer = this.activePlayer === 'A' ? this.radioPlayer : this.radioPlayerB;
    if (!currentPlayer) {return;}

    if (this.isPlaying) {
      currentPlayer.pause();
    } else {
      currentPlayer.play().catch(() => {
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
    const currentPlayer = this.activePlayer === 'A' ? this.radioPlayer : this.radioPlayerB;
    if (!currentPlayer) {return;}

    currentPlayer.muted = !currentPlayer.muted;
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
      this.fullscreenBtn.title = active ? 'Exit fullscreen' : 'Enter fullscreen';
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

  // ISS Context overlay methods
  showIssContext() {
    if (this.issContextOverlay) {
      this.issContextOverlay.style.display = 'block';
      this.isIssContextVisible = true;
      localStorage.setItem('issContextVisible', 'true');
      this.updateIssContextData();
    }
  }

  hideIssContext() {
    if (this.issContextOverlay) {
      this.issContextOverlay.style.display = 'none';
      this.isIssContextVisible = false;
      localStorage.setItem('issContextVisible', 'false');
    }
  }

  toggleIssContext() {
    if (this.isIssContextVisible) {
      this.hideIssContext();
    } else {
      this.showIssContext();
    }
  }

  updateIssContextData() {
    if (!this.isIssContextVisible) {return;}

    // Update position
    if (this.issLatLonElement) {
      const lat = this.lastIssPosition.lat.toFixed(3);
      const lon = this.lastIssPosition.lon.toFixed(3);
      this.issLatLonElement.textContent = `${lat}°, ${lon}°`;
    }

    // Update current region
    if (this.issCurrentRegionElement) {
      this.issCurrentRegionElement.textContent = this.currentRegion || 'Ocean';
    }

    // Update next ETA (placeholder - will be calculated)
    if (this.issNextEtaElement) {
      if (this.nextRegionEta) {
        this.issNextEtaElement.textContent = this.nextRegionEta;
      } else {
        this.issNextEtaElement.textContent = 'Calculating...';
      }
    }
  }

  calculateNextRegionEta() {
    // Simple ETA calculation based on ISS orbital speed (~7.66 km/s)
    // This is a simplified estimation for UX purposes

    // Get all possible regions and find the next one
    const allRegions = Object.keys(this.regionStations);
    const currentRegionIndex = allRegions.indexOf(this.currentRegion || 'Ocean');
    const nextRegionIndex = (currentRegionIndex + 1) % allRegions.length;
    const nextRegion = allRegions[nextRegionIndex];

    // Estimate time to next region (simplified - assumes uniform distribution)
    // ISS completes one orbit in ~92 minutes, with roughly 21 regions
    const averageTimePerRegion = (92 * 60) / 21; // seconds
    const etaSeconds = Math.floor(averageTimePerRegion + (Math.random() * 300 - 150)); // Add some variance

    const minutes = Math.floor(etaSeconds / 60);
    const seconds = etaSeconds % 60;

    this.nextRegionEta = `${nextRegion} in ${minutes}m ${seconds}s`;

    if (this.issNextEtaElement && this.isIssContextVisible) {
      this.issNextEtaElement.textContent = this.nextRegionEta;
    }
  }

  togglePathTrace() {
    this.pathTraceEnabled = !this.pathTraceEnabled;
    localStorage.setItem('pathTraceEnabled', this.pathTraceEnabled.toString());

    if (this.pathTraceToggle) {
      this.pathTraceToggle.textContent = `Path Trace: ${this.pathTraceEnabled ? 'ON' : 'OFF'}`;

      if (this.pathTraceEnabled) {
        this.pathTraceToggle.classList.add('active');
      } else {
        this.pathTraceToggle.classList.remove('active');
      }
    }

    // Notify main app about path trace toggle if needed
    if (window.geographyManager && typeof window.geographyManager.setPathTraceEnabled === 'function') {
      window.geographyManager.setPathTraceEnabled(this.pathTraceEnabled);
    }
  }

  // Method to be called from help overlay
  getIssContextToggleHandler() {
    return () => this.toggleIssContext();
  }
}

// Export for use in main application
window.RadioManager = RadioManager;