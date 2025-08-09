/* @vitest-environment jsdom */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../js/particles.js';
import '../js/geography.js';

// Mock p5.js global functions and classes
beforeEach(() => {
  global.width = 1000;
  global.height = 500;
  
  // Mock p5.js functions
  global.map = (value, inMin, inMax, outMin, outMax) => {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  };
  
  global.constrain = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };
  
  global.createVector = (x = 0, y = 0) => {
    return {
      x: x,
      y: y,
      set: function(x, y) { this.x = x; this.y = y; },
      copy: function() { return createVector(this.x, this.y); },
      add: function(v) { this.x += v.x; this.y += v.y; },
      sub: function(v) { this.x -= v.x; this.y -= v.y; },
      mult: function(n) { this.x *= n; this.y *= n; },
      setMag: function(mag) {
        const len = Math.sqrt(this.x * this.x + this.y * this.y);
        if (len > 0) {
          this.x = this.x / len * mag;
          this.y = this.y / len * mag;
        }
      },
      limit: function(max) {
        const len = Math.sqrt(this.x * this.x + this.y * this.y);
        if (len > max) {
          this.x = this.x / len * max;
          this.y = this.y / len * max;
        }
      }
    };
  };
  
  // Mock p5.Vector static methods
  global.p5 = {
    Vector: {
      sub: (v1, v2) => createVector(v1.x - v2.x, v1.y - v2.y),
      random2D: () => {
        const angle = Math.random() * Math.PI * 2;
        return createVector(Math.cos(angle), Math.sin(angle));
      }
    }
  };
  
  global.random = (min, max) => {
    if (Array.isArray(min)) {
      return min[Math.floor(Math.random() * min.length)];
    }
    if (max === undefined) {
      return Math.random() * min;
    }
    return Math.random() * (max - min) + min;
  };
  
  global.Math.abs = Math.abs;
  
  // Mock p5.js color function
  global.color = (r, g = r, b = r, a = 255) => {
    return { r, g, b, a };
  };
  
  global.lerp = (start, stop, amt) => {
    return start + (stop - start) * amt;
  };
  
  // Mock window globals
  global.window = global.window || {};
  global.window.particles = [];
  global.window.particleGeoData = [];
  global.window.continentPoints = [
    { x: 100, y: 100 },
    { x: 200, y: 150 },
    { x: 300, y: 200 }
  ];
  
  // Mock console methods to avoid test noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Resize Functionality', () => {
  let geographyManager;
  let testParticles;
  let testGeoData;

  beforeEach(() => {
    geographyManager = new window.GeographyManager();
    
    // Create test particles with known geographic data
    testParticles = [
      new window.Particle(100, 100, false), // Regular particle
      new window.Particle(200, 200, false), // Regular particle
      new window.Particle(500, 250, true)   // ISS particle
    ];
    
    // Create corresponding geographic data
    testGeoData = [
      { lat: 45.0, lon: -120.0 },  // North America
      { lat: 52.0, lon: 13.0 },    // Europe
    ];
    
    // Set up global references
    global.window.particles = testParticles;
    global.window.particleGeoData = testGeoData;
    
    // Set ISS geographic data
    geographyManager.issGeoData = { lat: 35.0, lon: 139.0 }; // Asia
  });

  describe('repositionParticlesAfterResize', () => {
    it('should maintain geographic coordinates when canvas dimensions change', () => {
      // Initial setup at 1000x500
      const initialPos1 = { x: testParticles[0].pos.x, y: testParticles[0].pos.y };
      const initialPos2 = { x: testParticles[1].pos.x, y: testParticles[1].pos.y };
      
      // Simulate resize to different dimensions
      global.width = 1200;
      global.height = 800;
      
      geographyManager.repositionParticlesAfterResize();
      
      // Particles should have moved to new positions based on geographic coordinates
      expect(testParticles[0].pos.x).not.toBe(initialPos1.x);
      expect(testParticles[0].pos.y).not.toBe(initialPos1.y);
      expect(testParticles[1].pos.x).not.toBe(initialPos2.x);
      expect(testParticles[1].pos.y).not.toBe(initialPos2.y);
      
      // Verify particles are within new canvas bounds
      testParticles.slice(0, 2).forEach(particle => {
        expect(particle.pos.x).toBeGreaterThanOrEqual(0);
        expect(particle.pos.x).toBeLessThanOrEqual(global.width);
        expect(particle.pos.y).toBeGreaterThanOrEqual(0);
        expect(particle.pos.y).toBeLessThanOrEqual(global.height);
      });
    });

    it('should handle missing geographic data gracefully', () => {
      global.window.particleGeoData = []; // Empty geo data
      
      // Should not throw error
      expect(() => {
        geographyManager.repositionParticlesAfterResize();
      }).not.toThrow();
    });

    it('should handle missing particles array gracefully', () => {
      global.window.particles = null;
      
      // Should not throw error and should return early
      expect(() => {
        geographyManager.repositionParticlesAfterResize();
      }).not.toThrow();
    });

    it('should preserve particle state during resize', () => {
      const particle = testParticles[0];
      
      // Set particle to moving state
      particle.isMoving = true;
      particle.vel = createVector(2, 1);
      
      geographyManager.repositionParticlesAfterResize();
      
      // State should be preserved
      expect(particle.isMoving).toBe(true);
    });

    it('should preserve resetting particle state during resize', () => {
      const particle = testParticles[0];
      
      // Set particle to resetting state
      particle.isResetting = true;
      particle.resetProgress = 0.5;
      
      geographyManager.repositionParticlesAfterResize();
      
      // Resetting state should be preserved
      expect(particle.isResetting).toBe(true);
      expect(particle.resetProgress).toBe(0.5);
    });
  });

  describe('ISS particle resize behavior', () => {
    it('should reposition ISS particle based on geographic coordinates', () => {
      const issParticle = testParticles[2]; // ISS is the last particle
      const initialPos = { x: issParticle.pos.x, y: issParticle.pos.y };
      
      // Simulate resize
      global.width = 800;
      global.height = 600;
      
      geographyManager.repositionParticlesAfterResize();
      
      // ISS should have moved based on its geographic coordinates
      expect(issParticle.pos.x).not.toBe(initialPos.x);
      expect(issParticle.pos.y).not.toBe(initialPos.y);
      
      // Both pos and target should be updated
      expect(issParticle.pos.x).toBe(issParticle.target.x);
      expect(issParticle.pos.y).toBe(issParticle.target.y);
    });

    it('should handle ISS horizontal wrapping correctly', () => {
      const issParticle = testParticles[2];
      
      // Set ISS near the edge (longitude close to 180°)
      geographyManager.issGeoData = { lat: 0, lon: 179 };
      
      global.width = 360; // Small width to test wrapping
      global.height = 180;
      
      geographyManager.repositionParticlesAfterResize();
      
      // ISS position should be within canvas bounds after wrapping
      expect(issParticle.pos.x).toBeGreaterThanOrEqual(0);
      expect(issParticle.pos.x).toBeLessThanOrEqual(global.width);
    });

    it('should handle ISS vertical bounds correctly', () => {
      const issParticle = testParticles[2];
      
      // Set ISS at extreme latitude
      geographyManager.issGeoData = { lat: 85, lon: 0 };
      
      geographyManager.repositionParticlesAfterResize();
      
      // ISS should be constrained within vertical bounds
      expect(issParticle.pos.y).toBeGreaterThanOrEqual(0);
      expect(issParticle.pos.y).toBeLessThanOrEqual(global.height);
      expect(issParticle.target.y).toBeGreaterThanOrEqual(0);
      expect(issParticle.target.y).toBeLessThanOrEqual(global.height);
    });
  });

  describe('coordinate conversion during resize', () => {
    it('should maintain coordinate conversion accuracy after resize', () => {
      const testLat = 37.7749; // San Francisco
      const testLon = -122.4194;
      
      // Convert at initial size
      const pos1 = geographyManager.latLonToXY(testLat, testLon);
      
      // Change canvas size
      global.width = 1600;
      global.height = 900;
      
      // Convert at new size
      const pos2 = geographyManager.latLonToXY(testLat, testLon);
      
      // Should get different pixel coordinates but same relative position
      expect(pos2.x / global.width).toBeCloseTo(pos1.x / 1000, 5);
      expect(pos2.y / global.height).toBeCloseTo(pos1.y / 500, 5);
    });

    it('should maintain inverse conversion accuracy', () => {
      // Test roundtrip conversion after resize
      global.width = 1920;
      global.height = 1080;
      
      const originalLat = 51.5074; // London
      const originalLon = -0.1278;
      
      const { x, y } = geographyManager.latLonToXY(originalLat, originalLon);
      const { lat, lon } = geographyManager.xyToLatLon(x, y);
      
      expect(lat).toBeCloseTo(originalLat, 10);
      expect(lon).toBeCloseTo(originalLon, 10);
    });
  });

  describe('continent points regeneration', () => {
    it('should regenerate continent points after resize', () => {
      const initialPoints = [...global.window.continentPoints];
      
      // Simulate resize
      global.width = 1400;
      global.height = 700;
      
      // Mock the generateContinentPoints method to track if it's called
      const generateSpy = vi.spyOn(geographyManager, 'generateContinentPoints');
      
      geographyManager.repositionParticlesAfterResize();
      
      expect(generateSpy).toHaveBeenCalled();
      generateSpy.mockRestore();
    });
  });

  describe('particle bounds constraints', () => {
    it('should constrain regular particles within canvas bounds', () => {
      const particle = testParticles[0];
      particle.r = 10; // Set particle radius
      
      // Set geographic data that would place particle outside bounds
      global.window.particleGeoData[0] = { lat: 90, lon: 180 }; // Extreme coordinates
      
      geographyManager.repositionParticlesAfterResize();
      
      // Particle should be constrained within canvas bounds considering its radius
      expect(particle.pos.x).toBeGreaterThanOrEqual(particle.r);
      expect(particle.pos.x).toBeLessThanOrEqual(global.width - particle.r);
      expect(particle.pos.y).toBeGreaterThanOrEqual(particle.r);
      expect(particle.pos.y).toBeLessThanOrEqual(global.height - particle.r);
    });

    it('should update originalPos to match new pos for regular particles', () => {
      const particle = testParticles[0];
      
      geographyManager.repositionParticlesAfterResize();
      
      expect(particle.pos.x).toBe(particle.originalPos.x);
      expect(particle.pos.y).toBe(particle.originalPos.y);
    });
  });

  describe('velocity limiting during resize', () => {
    it('should limit velocity for moving particles during resize', () => {
      const particle = testParticles[0];
      particle.isMoving = true;
      particle.vel = createVector(10, 10); // High velocity
      
      geographyManager.repositionParticlesAfterResize();
      
      // Velocity should be limited to 3
      const velocityMagnitude = Math.sqrt(particle.vel.x ** 2 + particle.vel.y ** 2);
      expect(velocityMagnitude).toBeLessThanOrEqual(3);
    });

    it('should not limit velocity for non-moving particles', () => {
      const particle = testParticles[0];
      particle.isMoving = false;
      const originalVel = createVector(10, 10);
      particle.vel = originalVel;
      
      geographyManager.repositionParticlesAfterResize();
      
      // Velocity should not be limited for non-moving particles
      expect(particle.vel.x).toBe(originalVel.x);
      expect(particle.vel.y).toBe(originalVel.y);
    });
  });
});