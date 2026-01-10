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
        { name: 'KCRW Los Angeles', url: 'https://kcrw.streamguys1.com/kcrw_192k_mp3_e24' },
        { name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
        { name: 'SomaFM Secret Agent', url: 'https://ice1.somafm.com/secretagent-128-mp3' },
        { name: 'SomaFM Indie Pop Rocks', url: 'https://ice1.somafm.com/indiepop-128-mp3' }
      ],
      'US East': [
        { name: 'WFMU New Jersey', url: 'https://stream0.wfmu.org/freeform-128k' },
        { name: 'WNYC New York', url: 'https://fm939.wnyc.org/wnycfm' },
        { name: 'WBGO Jazz Newark', url: 'https://wbgo.streamguys1.com/wbgo128' },
        { name: 'SomaFM Indie Pop Rocks', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
        { name: 'SomaFM Left Coast 70s', url: 'https://ice1.somafm.com/seventies-128-mp3' }
      ],
      'Canada': [
        { name: 'CBC Music', url: 'https://cbcradiolive.akamaized.net/hls/live/2016232/CBC_MUSIC_NAT_WEB/master.m3u8' },
        { name: 'SomaFM Folk Forward', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
        { name: 'SomaFM Covers', url: 'https://ice1.somafm.com/covers-128-mp3' },
        { name: 'SomaFM Boot Liquor', url: 'https://ice1.somafm.com/bootliquor-128-mp3' }
      ],
      'Mexico/Central America': [
        { name: 'Radio UNAM Mexico', url: 'https://132.247.4.19/radiounam.mp3' },
        { name: 'SomaFM Sonic Universe', url: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
        { name: 'SomaFM Fluid', url: 'https://ice1.somafm.com/fluid-128-mp3' },
        { name: 'SomaFM Lush', url: 'https://ice1.somafm.com/lush-128-mp3' }
      ],
      'Brazil': [
        { name: 'Radio Cultura Brasil', url: 'https://stream.radiocultura.com.br/live.mp3' },
        { name: 'Antena 1 Brazil', url: 'https://antena1.newradio.it/stream' },
        { name: 'SomaFM Bossa Beyond', url: 'https://ice2.somafm.com/bossa-128-mp3' },
        { name: 'SomaFM Groove Salad Classic', url: 'https://ice1.somafm.com/gsclassic-128-mp3' },
        { name: 'SomaFM PopTron', url: 'https://ice1.somafm.com/poptron-128-mp3' }
      ],
      'Argentina/Chile': [
        { name: 'Radio Nacional Argentina', url: 'https://s3.myradiostream.com/49108/listen.mp3' },
        { name: 'Radio Cooperativa Chile', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/COOPERATIVA_SC' },
        { name: 'SomaFM ThistleRadio', url: 'https://ice1.somafm.com/thistle-128-mp3' },
        { name: 'SomaFM Metal Detector', url: 'https://ice1.somafm.com/metal-128-mp3' },
        { name: 'SomaFM Synphaera', url: 'https://ice1.somafm.com/synphaera-128-mp3' }
      ],

      // Europe (4 regions)
      'Western Europe': [
        { name: 'FIP Paris', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
        { name: 'FIP Rock', url: 'https://icecast.radiofrance.fr/fiprock-midfi.mp3' },
        { name: 'FIP Jazz', url: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3' },
        { name: 'FIP Electro', url: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3' },
        { name: 'FIP World', url: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3' },
        { name: 'BBC Radio 6 Music', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_6music' }
      ],
      'Northern Europe': [
        { name: 'NRK P3 Norway', url: 'https://lyd.nrk.no/nrk_radio_p3_mp3_h' },
        { name: 'Sveriges Radio P3', url: 'https://sverigesradio.se/topsy/direkt/164-hi-mp3' },
        { name: 'SomaFM Deep Space One', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
        { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
        { name: 'SomaFM Space Station', url: 'https://ice1.somafm.com/spacestation-128-mp3' }
      ],
      'Eastern Europe': [
        { name: 'Polskie Radio 3', url: 'https://stream3.nadaje.com/radio357' },
        { name: 'SomaFM Underground 80s', url: 'https://ice4.somafm.com/u80s-128-mp3' },
        { name: 'SomaFM DEF CON Radio', url: 'https://ice1.somafm.com/defcon-128-mp3' },
        { name: 'SomaFM Cliqhop IDM', url: 'https://ice1.somafm.com/cliqhop-128-mp3' }
      ],
      'Mediterranean': [
        { name: 'RAI Radio 3 Italy', url: 'https://icestreaming.rai.it/3.mp3' },
        { name: 'Radio Swiss Pop', url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128' },
        { name: 'Radio Swiss Jazz', url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128' },
        { name: 'Radio Swiss Classic', url: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128' },
        { name: 'RNE Radio 3 Spain', url: 'https://radio3.rtveradio.cires21.com/radio3_hc.mp3' }
      ],

      // Asia (4 regions)
      'East Asia': [
        { name: 'J-Wave Tokyo', url: 'https://stream.j-wave.co.jp/jwave' },
        { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
        { name: 'SomaFM Mission Control', url: 'https://ice1.somafm.com/missioncontrol-128-mp3' },
        { name: 'SomaFM n5MD Radio', url: 'https://ice1.somafm.com/n5md-128-mp3' }
      ],
      'Southeast Asia': [
        { name: 'SomaFM Suburbs of Goa', url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3' },
        { name: 'SomaFM Dub Step Beyond', url: 'https://ice1.somafm.com/dubstep-128-mp3' },
        { name: 'SomaFM The Trip', url: 'https://ice1.somafm.com/thetrip-128-mp3' },
        { name: 'Radio Paradise World', url: 'https://stream.radioparadise.com/world-320' }
      ],
      'South Asia': [
        { name: 'All India Radio FM Gold', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio028/playlist.m3u8' },
        { name: 'Radio Mirchi', url: 'https://radioindia.net/radio/mirchi98/icecast.audio' },
        { name: 'Vividh Bharati', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio048/playlist.m3u8' },
        { name: 'SomaFM Beat Blender', url: 'https://ice1.somafm.com/beatblender-128-mp3' },
        { name: 'SomaFM Suburbs of Goa', url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3' },
        { name: 'SomaFM Digitalis', url: 'https://ice2.somafm.com/digitalis-128-mp3' }
      ],
      'Middle East': [
        { name: 'Radio Paradise World', url: 'https://stream.radioparadise.com/world-320' },
        { name: 'SomaFM Digitalis', url: 'https://ice2.somafm.com/digitalis-128-mp3' },
        { name: 'SomaFM BAGeL Radio', url: 'https://ice1.somafm.com/bagel-128-mp3' },
        { name: 'SomaFM Specials', url: 'https://ice1.somafm.com/specials-128-mp3' }
      ],

      // Africa (2 regions)
      'North Africa': [
        { name: 'Radio Algerienne Chaine 3', url: 'https://webradio.tda.dz/Chaine3_64K.mp3' },
        { name: 'Medi 1 Radio Morocco', url: 'https://streaming.medi1.com:8000/medi1_arab.mp3' },
        { name: 'Radio Tunis Culturelle', url: 'https://streaming.rntt.tn:8443/culturelle' },
        { name: 'Nile FM Egypt', url: 'https://stream.radiojar.com/8s5u5tpdtwzuv' },
        { name: 'SomaFM Doomed', url: 'https://ice4.somafm.com/doomed-128-mp3' },
        { name: 'SomaFM Black Rock FM', url: 'https://ice1.somafm.com/brfm-128-mp3' }
      ],
      'Sub-Saharan Africa': [
        { name: 'Trace Africa', url: 'https://stream.trace.tv/trace_africa' },
        { name: 'Capital FM Kenya', url: 'https://capitalfm.co.ke/stream' },
        { name: 'Metro FM South Africa', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM.mp3' },
        { name: 'Ukhozi FM South Africa', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/UKHOZI_FM.mp3' },
        { name: 'SomaFM Seven Inch Soul', url: 'https://ice1.somafm.com/7soul-128-mp3' },
        { name: 'SomaFM Reggae', url: 'https://ice1.somafm.com/reggae-128-mp3' }
      ],

      // Oceania/Pacific (2 regions)
      'Australia': [
        { name: 'Triple J Australia', url: 'https://live-radio02.mediahubaustralia.com/2TJW/mp3/' },
        { name: 'Double J Australia', url: 'https://live-radio01.mediahubaustralia.com/DJDW/mp3/' },
        { name: 'ABC Classic Australia', url: 'https://live-radio01.mediahubaustralia.com/ABCFM/mp3/' },
        { name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
        { name: 'SomaFM Secret Agent', url: 'https://ice1.somafm.com/secretagent-128-mp3' }
      ],
      'Pacific Islands': [
        { name: 'Radio New Zealand National', url: 'https://radionz-ice.streamguys.com/national' },
        { name: 'SomaFM Illinois Street Lounge', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
        { name: 'SomaFM Tiki Time', url: 'https://ice1.somafm.com/tikitime-128-mp3' },
        { name: 'Radio Paradise', url: 'https://stream.radioparadise.com/aac-320' }
      ],

      // Polar/Ocean (2 regions)
      'Arctic': [
        { name: 'SomaFM Deep Space One', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
        { name: 'SomaFM Space Station', url: 'https://ice1.somafm.com/spacestation-128-mp3' },
        { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
        { name: 'SomaFM Mission Control', url: 'https://ice1.somafm.com/missioncontrol-128-mp3' }
      ],
      'Ocean': [
        { name: 'Radio Paradise', url: 'https://stream.radioparadise.com/aac-320' },
        { name: 'Radio Paradise Mellow', url: 'https://stream.radioparadise.com/mellow-320' },
        { name: 'Radio Paradise Rock', url: 'https://stream.radioparadise.com/rock-320' },
        { name: 'Radio Paradise World', url: 'https://stream.radioparadise.com/world-320' },
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

        // Connect visualizer to the new active player
        this.connectVisualizer();
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
      currentPlayer.play().then(() => {
        // Connect audio visualizer when playback starts
        this.connectVisualizer();
      }).catch(() => {
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

  // Connect the current audio player to the visualizer
  connectVisualizer() {
    if (window.audioVisualizer) {
      const currentPlayer = this.activePlayer === 'A' ? this.radioPlayer : this.radioPlayerB;
      window.audioVisualizer.connectToAudio(currentPlayer);
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