// Geography and ISS tracking functionality
class GeographyManager {
  constructor() {
    this.issGeoData = { lat: 0, lon: 0 }; // Current ISS geographic coordinates
    this.simulateMode = false;
    this.simIndex = 0;
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

  generateContinentPoints() {
    window.continentPoints = [];

    // North America outline (simplified)
    const northAmerica = [
      [-60, -141], [-45, -141], [-45, -52], [-25, -80], [-25, -95],
      [-30, -117], [-48, -125], [-60, -141]
    ];

    // South America outline (simplified)
    const southAmerica = [
      [12, -81], [12, -34], [-20, -34], [-35, -58], [-55, -68],
      [-22, -81], [12, -81]
    ];

    // Europe outline (simplified)
    const europe = [
      [71, -10], [71, 40], [36, 40], [36, -10], [71, -10]
    ];

    // Africa outline (simplified)
    const africa = [
      [37, -18], [37, 51], [-35, 51], [-35, 15], [-22, -18], [37, -18]
    ];

    // Asia outline (simplified)
    const asia = [
      [77, 26], [77, 180], [10, 180], [10, 60], [40, 26], [77, 26]
    ];

    // Australia outline (simplified)
    const australia = [
      [-10, 113], [-10, 154], [-44, 154], [-44, 113], [-10, 113]
    ];

    const continents = [northAmerica, southAmerica, europe, africa, asia, australia];

    // Generate points along continent outlines
    for (const continent of continents) {
      for (let i = 0; i < continent.length - 1; i++) {
        const start = this.latLonToXY(continent[i][0], continent[i][1]);
        const end = this.latLonToXY(continent[i + 1][0], continent[i + 1][1]);

        // Generate points along the line between start and end
        const steps = 10;
        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const x = lerp(start.x, end.x, t);
          const y = lerp(start.y, end.y, t);
          window.continentPoints.push({x: x, y: y});
        }
      }
    }

    // Add some inland points for more realistic distribution
    for (let i = 0; i < window.continentPoints.length; i += 3) {
      const point = window.continentPoints[i];
      const offsetX = random(-50, 50);
      const offsetY = random(-50, 50);
      window.continentPoints.push({
        x: constrain(point.x + offsetX, 0, width),
        y: constrain(point.y + offsetY, 0, height)
      });
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

        // Ensure particle stays within canvas bounds
        particle.pos.x = constrain(particle.pos.x, particle.r || 10, width - (particle.r || 10));
        particle.pos.y = constrain(particle.pos.y, particle.r || 10, height - (particle.r || 10));
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