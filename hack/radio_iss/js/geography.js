// Geography and ISS tracking functionality
class GeographyManager {
  constructor() {
    this.issGeoData = { lat: 0, lon: 0 }; // Current ISS geographic coordinates
    this.simulateMode = false;
    this.simIndex = 0;
    this.orbitalPath = []; // Predicted ISS orbital path points
    this.showOrbitalPath = false; // Toggle for orbital path visibility
    this.simTrack = [
      // Ocean (mid-Pacific)
      { lat: 10, lon: -150 },
      // North America (central US)
      { lat: 39, lon: -98 },
      // Europe (Berlin)
      { lat: 52.52, lon: 13.405 },
      // Africa (Nigeria)
      { lat: 9.076, lon: 7.398 },
      // Asia (Tokyo)
      { lat: 35.676, lon: 139.65 },
      // Oceania (Sydney)
      { lat: -33.8688, lon: 151.2093 },
      // South America (São Paulo)
      { lat: -23.55, lon: -46.633 },
      // Back to Ocean (mid-Atlantic)
      { lat: 0, lon: -30 }
    ];
  }

  // Convert lat/lon to screen coordinates
  latLonToXY(lat, lon) {
    const x = map(lon, -180, 180, 0, width);
    const y = map(lat, 90, -90, 0, height);
    return {x: x, y: y};
  }

  // Convert screen coordinates back to lat/lon (for reverse calculation)
  xyToLatLon(x, y) {
    const lon = map(x, 0, width, -180, 180);
    const lat = map(y, 0, height, 90, -90);
    return {lat: lat, lon: lon};
  }

  // Calculate predicted ISS orbital path for the next 30-60 minutes
  calculateOrbitalPath(currentLat, currentLon, minutes = 60) {
    this.orbitalPath = [];

    // ISS orbital parameters (simplified approximation)
    const orbitalPeriod = 92.68; // ISS orbital period in minutes
    const meanMotion = 360 / orbitalPeriod; // degrees per minute
    const maxLatitude = 51.6; // ISS maximum latitude

    // Calculate path points every 2 minutes
    const timeSteps = Math.floor(minutes / 2);

    for (let i = 0; i < timeSteps; i++) {
      const timeOffset = i * 2; // minutes from now

      // Simplified orbital calculation
      // This approximates the ISS ground track using sinusoidal projection
      const orbitProgress = (timeOffset * meanMotion) % 360;
      const cyclePosition = (orbitProgress / 360) * 2 * Math.PI;

      // Calculate latitude with sinusoidal oscillation
      const lat = currentLat + Math.sin(cyclePosition) * (maxLatitude - Math.abs(currentLat)) * 0.8;

      // Calculate longitude with eastward movement
      const lonDelta = timeOffset * meanMotion * (360 / orbitalPeriod);
      let lon = currentLon + lonDelta;

      // Handle longitude wrapping
      while (lon > 180) {lon -= 360;}
      while (lon < -180) {lon += 360;}

      // Constrain latitude to ISS limits
      const constrainedLat = Math.max(-maxLatitude, Math.min(maxLatitude, lat));

      // Convert to screen coordinates
      const screenPos = this.latLonToXY(constrainedLat, lon);

      // Store both geographic and screen coordinates
      this.orbitalPath.push({
        lat: constrainedLat,
        lon: lon,
        x: screenPos.x,
        y: screenPos.y,
        timeOffset: timeOffset,
        region: this.getRegionForLatLon ? this.getRegionForLatLon(constrainedLat, lon) : 'Ocean'
      });
    }
  }

  // Get region for lat/lon coordinates (uses RadioManager's logic if available)
  getRegionForLatLon(lat, lon) {
    // Simplified region detection - use RadioManager if available
    if (window.radioManager && window.radioManager.getRegion) {
      return window.radioManager.getRegion(lat, lon);
    }

    // Fallback basic region detection
    if (lat >= 30 && lat <= 50 && lon >= -125 && lon <= -60) {return 'North America';}
    if (lat >= -30 && lat <= 15 && lon >= -80 && lon <= -30) {return 'South America';}
    if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {return 'Europe';}
    if (lat >= -35 && lat <= 35 && lon >= -20 && lon <= 55) {return 'Africa';}
    if (lat >= -10 && lat <= 70 && lon >= 60 && lon <= 180) {return 'Asia';}
    if (lat >= -50 && lat <= -10 && lon >= 110 && lon <= 180) {return 'Oceania';}
    return 'Ocean';
  }

  // Toggle orbital path visibility
  toggleOrbitalPath() {
    this.showOrbitalPath = !this.showOrbitalPath;
    console.log('ISS Orbital path:', this.showOrbitalPath ? 'ON' : 'OFF');

    // Recalculate path if turning on and we have ISS data
    if (this.showOrbitalPath && this.issGeoData) {
      this.calculateOrbitalPath(this.issGeoData.lat, this.issGeoData.lon);
    }

    return this.showOrbitalPath;
  }

  generateContinentPoints() {
    window.continentPoints = [];
    window.continentGroups = {}; // Store separate arrays for each continent

    // Calculate radio UI exclusion area
    const radioUIWidth = window.innerWidth <= 768 ? Math.max(260, window.innerWidth * 0.92) : Math.min(window.innerWidth * 0.85, 500);
    const radioUIHeight = 120; // Estimated height including padding and content
    const radioUILeft = window.innerWidth <= 768 ? Math.max(6, 0) : Math.max(12, 0);
    const radioUITop = window.innerWidth <= 768 ? Math.max(6, 0) : Math.max(12, 0);
    const radioUIRight = radioUILeft + radioUIWidth;
    const radioUIBottom = radioUITop + radioUIHeight;

    // Helper function to check if a point overlaps with radio UI
    const isInRadioUIArea = (x, y) => {
      return x >= radioUILeft && x <= radioUIRight && y >= radioUITop && y <= radioUIBottom;
    };

    // Define continent outlines with their names
    const continentDefinitions = {
      northAmerica: [
        [71, -156], [66, -166], [60, -165], [55, -130], [60, -125], [69, -105], [74, -95], [82, -85],
        [81, -68], [75, -57], [67, -53], [60, -57], [55, -62], [47, -52], [44, -57], [47, -67],
        [42, -70], [35, -75], [25, -80], [18, -97], [14, -105], [32, -117], [42, -124], [49, -128],
        [54, -132], [58, -134], [60, -139], [64, -141], [67, -148], [71, -156]
      ],
      southAmerica: [
        [12, -61], [8, -59], [5, -51], [2, -44], [-5, -35], [-13, -38], [-19, -40], [-23, -43],
        [-30, -51], [-33, -56], [-35, -58], [-38, -62], [-40, -65], [-43, -67], [-46, -67], [-50, -69],
        [-52, -70], [-55, -68], [-53, -66], [-50, -65], [-45, -64], [-40, -62], [-35, -58], [-30, -52],
        [-25, -48], [-20, -44], [-15, -39], [-10, -36], [-5, -35], [0, -44], [5, -50], [10, -55], [12, -61]
      ],
      europe: [
        [71, -25], [71, -8], [70, 5], [69, 12], [66, 24], [64, 28], [59, 30], [56, 27], [54, 20],
        [51, 13], [48, 7], [46, 2], [44, 9], [42, 19], [40, 27], [36, 28], [34, 23], [36, 12],
        [38, 3], [41, -5], [43, -9], [46, -4], [49, -1], [52, -3], [55, -6], [58, -3], [61, 5],
        [64, 10], [67, 15], [70, 20], [71, -25]
      ],
      africa: [
        [37, -17], [35, -6], [33, 3], [31, 10], [32, 22], [34, 32], [37, 43], [35, 48], [31, 51],
        [25, 50], [15, 51], [5, 50], [-5, 48], [-15, 45], [-20, 40], [-25, 32], [-30, 25], [-33, 18],
        [-35, 15], [-34, 22], [-32, 28], [-28, 35], [-22, 40], [-15, 43], [-8, 45], [2, 47], [12, 48],
        [22, 45], [30, 40], [35, 32], [37, 22], [36, 10], [35, -2], [37, -17]
      ],
      asia: [
        [77, 40], [75, 60], [73, 80], [70, 100], [65, 120], [55, 135], [45, 145], [35, 140], [25, 135],
        [20, 125], [15, 110], [10, 95], [8, 75], [12, 60], [18, 50], [25, 45], [35, 42], [45, 40],
        [55, 35], [65, 30], [70, 35], [72, 45], [75, 55], [76, 65], [77, 75], [75, 85], [70, 95],
        [65, 105], [60, 115], [58, 125], [60, 135], [65, 145], [70, 155], [75, 165], [77, 175], [77, 40]
      ],
      oceania: [
        [-10, 113], [-12, 118], [-16, 122], [-20, 126], [-25, 129], [-30, 132], [-35, 135], [-40, 140],
        [-43, 145], [-44, 148], [-43, 151], [-40, 153], [-35, 154], [-30, 153], [-25, 151], [-20, 148],
        [-15, 145], [-12, 140], [-10, 135], [-9, 130], [-10, 125], [-12, 120], [-10, 115], [-10, 113]
      ]
    };

    // Generate points for each continent separately
    for (const [continentName, continentOutline] of Object.entries(continentDefinitions)) {
      window.continentGroups[continentName] = [];

      // Generate outline points
      for (let i = 0; i < continentOutline.length - 1; i++) {
        const start = this.latLonToXY(continentOutline[i][0], continentOutline[i][1]);
        const end = this.latLonToXY(continentOutline[i + 1][0], continentOutline[i + 1][1]);

        const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const steps = Math.max(5, Math.floor(distance / 15));

        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const x = start.x + (end.x - start.x) * t;
          const y = start.y + (end.y - start.y) * t;

          const offsetX = (Math.random() - 0.5) * 6;
          const offsetY = (Math.random() - 0.5) * 6;

          let pointX = Math.max(0, Math.min(width, x + offsetX));
          let pointY = Math.max(0, Math.min(height, y + offsetY));

          // If point overlaps with radio UI, try to move it outside
          if (isInRadioUIArea(pointX, pointY)) {
            // Try moving below the radio UI first
            if (pointY < radioUIBottom + 20) {
              pointY = radioUIBottom + 20;
            }
            // If still in bounds, otherwise try moving to the right
            if (pointY > height && pointX < radioUIRight + 20) {
              pointX = radioUIRight + 20;
              pointY = Math.max(0, Math.min(height, y + offsetY));
            }
            // Ensure final position is within canvas bounds
            pointX = Math.max(0, Math.min(width, pointX));
            pointY = Math.max(0, Math.min(height, pointY));
          }

          const point = {
            x: pointX,
            y: pointY,
            continent: continentName
          };

          window.continentGroups[continentName].push(point);
          window.continentPoints.push(point);
        }
      }

      // Add inland points for this continent
      const originalCount = window.continentGroups[continentName].length;
      for (let i = 0; i < originalCount; i += 2) {
        const point = window.continentGroups[continentName][i];

        for (let k = 0; k < 2; k++) {
          const offsetDistance = 20 + Math.random() * 60;
          const offsetAngle = Math.random() * Math.PI * 2;
          const offsetX = Math.cos(offsetAngle) * offsetDistance;
          const offsetY = Math.sin(offsetAngle) * offsetDistance;

          let inlandX = Math.max(0, Math.min(width, point.x + offsetX));
          let inlandY = Math.max(0, Math.min(height, point.y + offsetY));

          // If point overlaps with radio UI, try to move it outside
          if (isInRadioUIArea(inlandX, inlandY)) {
            // Try moving below the radio UI first
            if (inlandY < radioUIBottom + 20) {
              inlandY = radioUIBottom + 20;
            }
            // If still in bounds, otherwise try moving to the right
            if (inlandY > height && inlandX < radioUIRight + 20) {
              inlandX = radioUIRight + 20;
              inlandY = Math.max(0, Math.min(height, point.y + offsetY));
            }
            // Ensure final position is within canvas bounds
            inlandX = Math.max(0, Math.min(width, inlandX));
            inlandY = Math.max(0, Math.min(height, inlandY));
          }

          const inlandPoint = {
            x: inlandX,
            y: inlandY,
            continent: continentName
          };

          window.continentGroups[continentName].push(inlandPoint);
          window.continentPoints.push(inlandPoint);
        }
      }

      // Add coastal shelf points for this continent
      for (let i = 0; i < originalCount; i += 4) {
        const point = window.continentGroups[continentName][i];

        const shelfDistance = 10 + Math.random() * 30;
        const shelfAngle = Math.random() * Math.PI * 2;
        const shelfX = Math.cos(shelfAngle) * shelfDistance;
        const shelfY = Math.sin(shelfAngle) * shelfDistance;

        let shelfPointX = Math.max(0, Math.min(width, point.x + shelfX));
        let shelfPointY = Math.max(0, Math.min(height, point.y + shelfY));

        // If point overlaps with radio UI, try to move it outside
        if (isInRadioUIArea(shelfPointX, shelfPointY)) {
          // Try moving below the radio UI first
          if (shelfPointY < radioUIBottom + 20) {
            shelfPointY = radioUIBottom + 20;
          }
          // If still in bounds, otherwise try moving to the right
          if (shelfPointY > height && shelfPointX < radioUIRight + 20) {
            shelfPointX = radioUIRight + 20;
            shelfPointY = Math.max(0, Math.min(height, point.y + shelfY));
          }
          // Ensure final position is within canvas bounds
          shelfPointX = Math.max(0, Math.min(width, shelfPointX));
          shelfPointY = Math.max(0, Math.min(height, shelfPointY));
        }

        const shelfPoint = {
          x: shelfPointX,
          y: shelfPointY,
          continent: continentName
        };

        window.continentGroups[continentName].push(shelfPoint);
        window.continentPoints.push(shelfPoint);
      }
    }

    console.log('Continent point distribution:');
    for (const [name, points] of Object.entries(window.continentGroups)) {
      console.log(`${name}: ${points.length} points`);
    }
  }

  // Reposition all particles based on their stored geographic data
  repositionParticlesAfterResize() {
    console.log(`Repositioning particles after resize... Canvas: ${width}x${height}`);

    // Regenerate continent points with new canvas dimensions
    this.generateContinentPoints();

    // Check if we have the necessary data
    if (!window.particles || !window.particleGeoData) {
      console.warn('Missing particles or geographic data for resize');
      return;
    }

    console.log(`Repositioning ${window.particles.length} particles using ${window.particleGeoData.length} geo data points`);

    // Reposition continent-based particles
    const regularParticleCount = window.particles.length - 1; // All particles except ISS
    for (let i = 0; i < regularParticleCount; i++) {
      const particle = window.particles[i];
      const geoData = window.particleGeoData[i];

      if (particle && geoData) {
        // Store old position for comparison
        const oldX = particle.pos.x;
        const oldY = particle.pos.y;

        // Convert geographic coordinates back to new screen coordinates
        const newPos = this.latLonToXY(geoData.lat, geoData.lon);
        particle.pos.set(newPos.x, newPos.y);
        particle.originalPos.set(newPos.x, newPos.y);

        // Ensure particle stays within canvas bounds and avoids radio UI
        particle.pos.x = constrain(particle.pos.x, particle.r || 10, width - (particle.r || 10));
        particle.pos.y = constrain(particle.pos.y, particle.r || 10, height - (particle.r || 10));

        // Calculate radio UI exclusion area for resize
        const radioUIWidth = window.innerWidth <= 768 ? Math.max(260, window.innerWidth * 0.92) : Math.min(window.innerWidth * 0.85, 500);
        const radioUIHeight = 120;
        const radioUILeft = window.innerWidth <= 768 ? Math.max(6, 0) : Math.max(12, 0);
        const radioUITop = window.innerWidth <= 768 ? Math.max(6, 0) : Math.max(12, 0);
        const radioUIRight = radioUILeft + radioUIWidth;
        const radioUIBottom = radioUITop + radioUIHeight;

        // If particle overlaps with radio UI, move it outside
        if (particle.pos.x >= radioUILeft && particle.pos.x <= radioUIRight &&
            particle.pos.y >= radioUITop && particle.pos.y <= radioUIBottom) {
          // Try moving below the radio UI first
          if (particle.pos.y < radioUIBottom + 20) {
            particle.pos.y = radioUIBottom + 20;
          }
          // If still in bounds, otherwise try moving to the right
          if (particle.pos.y > height && particle.pos.x < radioUIRight + 20) {
            particle.pos.x = radioUIRight + 20;
            particle.pos.y = constrain(particle.pos.y, particle.r || 10, height - (particle.r || 10));
          }
          // Ensure final position is within canvas bounds
          particle.pos.x = constrain(particle.pos.x, particle.r || 10, width - (particle.r || 10));
          particle.pos.y = constrain(particle.pos.y, particle.r || 10, height - (particle.r || 10));
        }

        particle.originalPos.x = particle.pos.x;
        particle.originalPos.y = particle.pos.y;

        // Log position change for debugging
        if (i < 3) { // Only log first 3 particles to avoid spam
          console.log(`Particle ${i}: (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) -> (${particle.pos.x.toFixed(1)}, ${particle.pos.y.toFixed(1)}) | Geo: ${geoData.lat.toFixed(2)}, ${geoData.lon.toFixed(2)}`);
        }


        // If particle was resetting, recalculate reset animation with new positions
        if (particle.isResetting) {
          // Reset animation will continue to the new originalPos
          // No additional action needed as originalPos has been updated above
        }

        // Constrain moving particles to new canvas bounds
        if (particle.isMoving && !particle.isResetting) {
          particle.vel.limit(3); // Ensure velocity doesn't get too high during resize
        }
      }
    }

    // Reposition ISS particle with proper wrapping
    const issParticle = window.particles[window.particles.length - 1]; // ISS is last particle
    if (issParticle && issParticle.isIss && this.issGeoData) {
      const issPos = this.latLonToXY(this.issGeoData.lat, this.issGeoData.lon);

      // Handle horizontal wrapping for ISS (longitude -180 to 180 maps to 0 to width)
      let wrappedX = issPos.x;
      if (wrappedX < 0) {
        wrappedX += width;
      }
      if (wrappedX > width) {
        wrappedX -= width;
      }

      issParticle.pos.set(wrappedX, issPos.y);
      issParticle.target.set(wrappedX, issPos.y);

      // Ensure ISS stays within vertical bounds
      issParticle.pos.y = constrain(issParticle.pos.y, 0, height);
      issParticle.target.y = constrain(issParticle.target.y, 0, height);

      console.log(`ISS repositioned to: (${wrappedX}, ${issParticle.pos.y})`);
    }

    console.log('Particle repositioning complete');
  }

  initTracking(radioManager) {
    // Determine simulation mode from URL param
    const params = new URLSearchParams(window.location.search);
    this.simulateMode = params.get('debug') === '1';

    // Real ISS update function
    const updateISSReal = () => {
      fetch('https://api.wheretheiss.at/v1/satellites/25544')
        .then(response => response.json())
        .then(data => {
          const lat = data.latitude;
          const lon = data.longitude;

          // Store ISS geographic coordinates for resize handling
          this.issGeoData.lat = lat;
          this.issGeoData.lon = lon;

          const x = map(lon, -180, 180, 0, width);
          const y = map(lat, 90, -90, 0, height);

          // Update ISS particle target
          const issParticle = window.particles[window.particles.length - 1];
          if (issParticle && issParticle.isIss) {
            issParticle.target.set(x, y);
          }

          // Update orbital path if it's enabled
          if (this.showOrbitalPath) {
            this.calculateOrbitalPath(lat, lon);
          }

          radioManager.updateRadioForLocation(lat, lon);
        })
        .catch(() => {
          // On failure, keep last position and station
        });
    };

    // Simulated ISS update function
    const updateISSSim = () => {
      const point = this.simTrack[this.simIndex % this.simTrack.length];
      this.simIndex += 1;
      const lat = point.lat;
      const lon = point.lon;

      // Store ISS geographic coordinates for resize handling
      this.issGeoData.lat = lat;
      this.issGeoData.lon = lon;

      const x = map(lon, -180, 180, 0, width);
      const y = map(lat, 90, -90, 0, height);

      // Update ISS particle target
      const issParticle = window.particles[window.particles.length - 1];
      if (issParticle && issParticle.isIss) {
        issParticle.target.set(x, y);
      }

      // Update orbital path if it's enabled
      if (this.showOrbitalPath) {
        this.calculateOrbitalPath(lat, lon);
      }

      radioManager.updateRadioForLocation(lat, lon);
    };

    if (this.simulateMode) {
      updateISSSim();
      setInterval(updateISSSim, 5000);
    } else {
      updateISSReal();
      setInterval(updateISSReal, 5000);
    }
  }
}

// Export for use in main application
window.GeographyManager = GeographyManager;