/**
 * Mercator Projection Tests
 * Real-Time ISS Tracker with Mercator Projection
 * 
 * Test suite for validating Mercator projection accuracy and performance
 */

// Test framework mock (simple implementation)
const test = (name, fn) => {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
    }
};

const expect = (actual) => ({
    toBe: (expected) => {
        if (actual !== expected) {
            throw new Error(`Expected ${expected}, got ${actual}`);
        }
    },
    toBeCloseTo: (expected, precision = 2) => {
        const factor = Math.pow(10, precision);
        if (Math.round(actual * factor) !== Math.round(expected * factor)) {
            throw new Error(`Expected ${expected} (±${1/factor}), got ${actual}`);
        }
    },
    toBeTruthy: () => {
        if (!actual) {
            throw new Error(`Expected truthy value, got ${actual}`);
        }
    },
    toBeFalsy: () => {
        if (actual) {
            throw new Error(`Expected falsy value, got ${actual}`);
        }
    }
});

// Test data - known coordinate pairs for accuracy testing
const testCoordinates = [
    { lat: 0, lng: 0, name: 'Equator/Prime Meridian' },
    { lat: 51.4769, lng: -0.0005, name: 'London' },
    { lat: 40.7128, lng: -74.0060, name: 'New York' },
    { lat: -33.8651, lng: 151.2099, name: 'Sydney' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
    { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro' },
    { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
    { lat: -26.2041, lng: 28.0473, name: 'Johannesburg' },
    { lat: 1.3521, lng: 103.8198, name: 'Singapore' }
];

/**
 * Run all Mercator projection tests
 */
function runProjectionTests() {
    console.log('🧪 Running Mercator Projection Tests...\n');
    
    // Create test projection instance
    const projection = new MercatorProjection(1920, 1080);
    
    // Basic functionality tests
    testBasicProjection(projection);
    testProjectionAccuracy(projection);
    testBoundaryConditions(projection);
    testCoordinateValidation(projection);
    testUtilityFunctions(projection);
    testPerformance(projection);
    testEdgeCases(projection);
    
    console.log('\n✨ Projection tests completed!');
}

/**
 * Test basic projection functionality
 */
function testBasicProjection(projection) {
    console.log('📍 Basic Projection Tests:');
    
    test('should initialize with correct dimensions', () => {
        expect(projection.width).toBe(1920);
        expect(projection.height).toBe(1080);
    });
    
    test('should project equator/prime meridian to center', () => {
        const result = projection.project(0, 0);
        expect(result.x).toBeCloseTo(960, 0); // Half width
        expect(result.y).toBeCloseTo(540, 0); // Half height
        expect(result.valid).toBeTruthy();
    });
    
    test('should handle longitude extremes', () => {
        const westResult = projection.project(0, -180);
        const eastResult = projection.project(0, 180);
        
        expect(westResult.x).toBeCloseTo(0, 0);
        expect(eastResult.x).toBeCloseTo(1920, 0);
    });
    
    test('should handle latitude extremes', () => {
        const northResult = projection.project(85, 0);
        const southResult = projection.project(-85, 0);
        
        expect(northResult.y).toBe(0);
        expect(southResult.y).toBe(1080);
    });
}

/**
 * Test projection accuracy with known coordinates
 */
function testProjectionAccuracy(projection) {
    console.log('\n🎯 Projection Accuracy Tests:');
    
    testCoordinates.forEach(coord => {
        test(`should accurately project and unproject ${coord.name}`, () => {
            const projected = projection.project(coord.lat, coord.lng);
            const unprojected = projection.unproject(projected.x, projected.y);
            
            // Allow small tolerance for floating point errors
            expect(unprojected.latitude).toBeCloseTo(coord.lat, 4);
            expect(unprojected.longitude).toBeCloseTo(coord.lng, 4);
            expect(projected.valid).toBeTruthy();
            expect(unprojected.valid).toBeTruthy();
        });
    });
    
    test('should maintain projection consistency', () => {
        const testLat = 45.5;
        const testLng = -73.6;
        
        // Project multiple times
        const result1 = projection.project(testLat, testLng);
        const result2 = projection.project(testLat, testLng);
        
        expect(result1.x).toBe(result2.x);
        expect(result1.y).toBe(result2.y);
    });
}

/**
 * Test boundary conditions and edge cases
 */
function testBoundaryConditions(projection) {
    console.log('\n🚧 Boundary Condition Tests:');
    
    test('should clamp extreme latitudes', () => {
        const northPole = projection.project(90, 0);
        const southPole = projection.project(-90, 0);
        
        expect(northPole.clamped).toBeTruthy();
        expect(southPole.clamped).toBeTruthy();
    });
    
    test('should handle dateline crossing', () => {
        const west179 = projection.project(0, -179);
        const east179 = projection.project(0, 179);
        
        expect(Math.abs(west179.x - east179.x)).toBeCloseTo(projection.width - projection.pixelsPerDegree * 2, 0);
    });
    
    test('should normalize longitude wrapping', () => {
        const normal = projection.project(0, 45);
        const wrapped1 = projection.project(0, 45 + 360);
        const wrapped2 = projection.project(0, 45 - 360);
        
        // Results should be the same after normalization
        const unproj1 = projection.unproject(normal.x, normal.y);
        const unproj2 = projection.unproject(wrapped1.x, wrapped1.y);
        const unproj3 = projection.unproject(wrapped2.x, wrapped2.y);
        
        expect(unproj1.longitude).toBeCloseTo(unproj2.longitude, 4);
        expect(unproj1.longitude).toBeCloseTo(unproj3.longitude, 4);
    });
}

/**
 * Test coordinate validation
 */
function testCoordinateValidation(projection) {
    console.log('\n✅ Coordinate Validation Tests:');
    
    test('should validate correct coordinates', () => {
        expect(projection.isValidCoordinate(45.5, -73.6)).toBeTruthy();
        expect(projection.isValidCoordinate(0, 0)).toBeTruthy();
        expect(projection.isValidCoordinate(-90, -180)).toBeTruthy();
        expect(projection.isValidCoordinate(90, 180)).toBeTruthy();
    });
    
    test('should reject invalid coordinates', () => {
        expect(projection.isValidCoordinate(91, 0)).toBeFalsy();
        expect(projection.isValidCoordinate(-91, 0)).toBeFalsy();
        expect(projection.isValidCoordinate(0, 181)).toBeFalsy();
        expect(projection.isValidCoordinate(0, -181)).toBeFalsy();
        expect(projection.isValidCoordinate(NaN, 0)).toBeFalsy();
        expect(projection.isValidCoordinate(0, NaN)).toBeFalsy();
        expect(projection.isValidCoordinate('45', '73')).toBeFalsy();
    });
    
    test('should validate pixel coordinates', () => {
        expect(projection.isWithinBounds(0, 0)).toBeTruthy();
        expect(projection.isWithinBounds(1919, 1079)).toBeTruthy();
        expect(projection.isWithinBounds(960, 540)).toBeTruthy();
        
        expect(projection.isWithinBounds(-1, 0)).toBeFalsy();
        expect(projection.isWithinBounds(0, -1)).toBeFalsy();
        expect(projection.isWithinBounds(1920, 0)).toBeFalsy();
        expect(projection.isWithinBounds(0, 1080)).toBeFalsy();
    });
}

/**
 * Test utility functions
 */
function testUtilityFunctions(projection) {
    console.log('\n🔧 Utility Function Tests:');
    
    test('should calculate distance correctly', () => {
        // Distance from New York to London (approximately 5570 km)
        const distance = projection.calculateDistance(40.7128, -74.0060, 51.4769, -0.0005);
        expect(distance).toBeCloseTo(5570, 0); // Within 100km tolerance
    });
    
    test('should calculate bearing correctly', () => {
        // Bearing from New York to London (approximately northeast)
        const bearing = projection.calculateBearing(40.7128, -74.0060, 51.4769, -0.0005);
        expect(bearing).toBeCloseTo(51, 0); // Approximate bearing
    });
    
    test('should interpolate positions correctly', () => {
        const start = { lat: 0, lng: 0 };
        const end = { lat: 10, lng: 10 };
        
        const midpoint = projection.interpolatePosition(start, end, 0.5);
        expect(midpoint.lat).toBeCloseTo(5, 1);
        expect(midpoint.lng).toBeCloseTo(5, 1);
        
        const quarter = projection.interpolatePosition(start, end, 0.25);
        expect(quarter.lat).toBeCloseTo(2.5, 1);
        expect(quarter.lng).toBeCloseTo(2.5, 1);
    });
    
    test('should handle dateline crossing in interpolation', () => {
        const start = { lat: 0, lng: 170 };
        const end = { lat: 0, lng: -170 };
        
        const midpoint = projection.interpolatePosition(start, end, 0.5);
        expect(Math.abs(midpoint.lng - 180)).toBeLessThan(5); // Should cross dateline
    });
    
    test('should calculate scale factors correctly', () => {
        const equatorScale = projection.getScaleFactor(0);
        const arcticScale = projection.getScaleFactor(60);
        
        expect(equatorScale).toBeCloseTo(1.0, 2);
        expect(arcticScale).toBeCloseTo(2.0, 1); // Approximately 2x distortion at 60°
    });
}

/**
 * Test performance characteristics
 */
function testPerformance(projection) {
    console.log('\n⚡ Performance Tests:');
    
    test('should project coordinates quickly', () => {
        const iterations = 10000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            const lat = (Math.random() - 0.5) * 170; // -85 to 85
            const lng = (Math.random() - 0.5) * 360; // -180 to 180
            projection.project(lat, lng);
        }
        
        const endTime = performance.now();
        const timePerProjection = (endTime - startTime) / iterations;
        
        expect(timePerProjection).toBeLessThan(1); // Should be less than 1ms per projection
        console.log(`    Average projection time: ${timePerProjection.toFixed(3)}ms`);
    });
    
    test('should unproject coordinates quickly', () => {
        const iterations = 10000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            const x = Math.random() * projection.width;
            const y = Math.random() * projection.height;
            projection.unproject(x, y);
        }
        
        const endTime = performance.now();
        const timePerUnprojection = (endTime - startTime) / iterations;
        
        expect(timePerUnprojection).toBeLessThan(1); // Should be less than 1ms per unprojection
        console.log(`    Average unprojection time: ${timePerUnprojection.toFixed(3)}ms`);
    });
}

/**
 * Test edge cases and error conditions
 */
function testEdgeCases(projection) {
    console.log('\n🎭 Edge Case Tests:');
    
    test('should handle dimension updates', () => {
        const originalWidth = projection.width;
        const originalHeight = projection.height;
        
        projection.updateDimensions(1024, 768);
        expect(projection.width).toBe(1024);
        expect(projection.height).toBe(768);
        
        // Test that projection still works with new dimensions
        const result = projection.project(0, 0);
        expect(result.x).toBeCloseTo(512, 0);
        expect(result.y).toBeCloseTo(384, 0);
        
        // Restore original dimensions
        projection.updateDimensions(originalWidth, originalHeight);
    });
    
    test('should handle very small dimensions', () => {
        const smallProjection = new MercatorProjection(10, 10);
        const result = smallProjection.project(0, 0);
        
        expect(result.x).toBeCloseTo(5, 0);
        expect(result.y).toBeCloseTo(5, 0);
        expect(result.valid).toBeTruthy();
    });
    
    test('should handle zero dimensions gracefully', () => {
        const zeroProjection = new MercatorProjection(0, 0);
        const result = zeroProjection.project(0, 0);
        
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });
    
    test('should provide accurate projection info', () => {
        const info = projection.getProjectionInfo();
        
        expect(info.type).toBe('Mercator (Web Mercator)');
        expect(info.epsg).toBe('EPSG:3857');
        expect(info.datum).toBe('WGS84');
        expect(info.dimensions.width).toBe(projection.width);
        expect(info.dimensions.height).toBe(projection.height);
    });
    
    test('should run accuracy tests', () => {
        const testResults = projection.testProjectionAccuracy();
        
        expect(testResults.testPoints.length).toBeCloseTo(6, 0);
        expect(testResults.summary.accuracyPercentage).toBeCloseTo(100, 0);
        
        // All test points should be accurate
        testResults.testPoints.forEach(point => {
            expect(point.pixelAccuracy).toBeTruthy();
        });
    });
}

// Auto-run tests when this file is loaded
if (typeof window !== 'undefined' && window.MercatorProjection) {
    // Browser environment
    window.addEventListener('load', () => {
        setTimeout(runProjectionTests, 1000); // Allow time for other components to load
    });
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { runProjectionTests };
}

// Make test runner available globally
if (typeof window !== 'undefined') {
    window.runProjectionTests = runProjectionTests;
}