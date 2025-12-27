/**
 * Mercator Projection Implementation
 * Real-Time ISS Tracker with Mercator Projection
 * 
 * Implements precise mathematical Mercator projection for converting
 * latitude/longitude coordinates to pixel coordinates and vice versa.
 * 
 * Mathematical formulas based on:
 * - Web Mercator (EPSG:3857)
 * - WGS84 coordinate system
 * - Precise spherical Earth approximation
 */

class MercatorProjection {
    /**
     * Initialize Mercator projection with canvas dimensions
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Web Mercator bounds (avoids extreme distortion at poles)
        this.bounds = {
            latMin: -85.051128779806592,  // ~85.05°S (Web Mercator limit)
            latMax: 85.051128779806592,   // ~85.05°N (Web Mercator limit)  
            lonMin: -180,                 // 180°W
            lonMax: 180                   // 180°E
        };
        
        // Mathematical constants
        this.EARTH_RADIUS = 6378137; // Earth radius in meters (WGS84)
        this.HALF_CIRCUMFERENCE = Math.PI * this.EARTH_RADIUS;
        this.DEG_TO_RAD = Math.PI / 180;
        this.RAD_TO_DEG = 180 / Math.PI;
        
        // Pre-calculated values for performance
        this.widthHalf = this.width / 2;
        this.heightHalf = this.height / 2;
        this.pixelsPerDegree = this.width / 360;
        this.pixelsPerRadian = this.width / (2 * Math.PI);
        
        console.log(`Mercator projection initialized: ${width}x${height}`);
        console.log(`Bounds: lat(${this.bounds.latMin.toFixed(2)}, ${this.bounds.latMax.toFixed(2)}), lon(${this.bounds.lonMin}, ${this.bounds.lonMax})`);
    }
    
    /**
     * Update canvas dimensions and recalculate projection parameters
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
        
        // Recalculate derived values
        this.widthHalf = this.width / 2;
        this.heightHalf = this.height / 2;
        this.pixelsPerDegree = this.width / 360;
        this.pixelsPerRadian = this.width / (2 * Math.PI);
        
        console.log(`Mercator projection updated: ${width}x${height}`);
    }
    
    /**
     * Project latitude/longitude to pixel coordinates
     * Uses the standard Mercator projection formula
     * 
     * @param {number} latitude - Latitude in decimal degrees (-90 to 90)
     * @param {number} longitude - Longitude in decimal degrees (-180 to 180)
     * @returns {Object} Object with x, y pixel coordinates
     */
    project(latitude, longitude) {
        // Input validation
        if (!this.isValidCoordinate(latitude, longitude)) {
            console.warn(`Invalid coordinates: lat=${latitude}, lng=${longitude}`);
            return { x: 0, y: 0, valid: false };
        }
        
        // Clamp latitude to Web Mercator bounds
        const clampedLat = Math.max(this.bounds.latMin, Math.min(this.bounds.latMax, latitude));
        
        // Normalize longitude to [-180, 180]
        const normalizedLng = this.normalizeLongitude(longitude);
        
        // Longitude to X coordinate (linear transformation)
        const x = (normalizedLng + 180) * this.pixelsPerDegree;
        
        // Latitude to Y coordinate (Mercator projection)
        const latRad = clampedLat * this.DEG_TO_RAD;
        const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
        const y = this.heightHalf - (mercatorY * this.pixelsPerRadian);
        
        return {
            x: Math.round(x),
            y: Math.round(y),
            valid: true,
            clamped: clampedLat !== latitude
        };
    }
    
    /**
     * Unproject pixel coordinates back to latitude/longitude
     * Inverse of the project function
     * 
     * @param {number} x - X pixel coordinate
     * @param {number} y - Y pixel coordinate
     * @returns {Object} Object with latitude, longitude in decimal degrees
     */
    unproject(x, y) {
        // Input validation
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            console.warn(`Pixel coordinates out of bounds: x=${x}, y=${y}`);
            return { latitude: 0, longitude: 0, valid: false };
        }
        
        // X coordinate to longitude
        const longitude = (x / this.pixelsPerDegree) - 180;
        
        // Y coordinate to latitude (inverse Mercator)
        const mercatorY = (this.heightHalf - y) / this.pixelsPerRadian;
        const latRad = 2 * (Math.atan(Math.exp(mercatorY)) - Math.PI / 4);
        const latitude = latRad * this.RAD_TO_DEG;
        
        return {
            latitude: this.roundToPrecision(latitude, 6),
            longitude: this.roundToPrecision(this.normalizeLongitude(longitude), 6),
            valid: true
        };
    }
    
    /**
     * Calculate the distance between two geographic points using Haversine formula
     * @param {number} lat1 - First point latitude
     * @param {number} lng1 - First point longitude
     * @param {number} lat2 - Second point latitude
     * @param {number} lng2 - Second point longitude
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const dLat = (lat2 - lat1) * this.DEG_TO_RAD;
        const dLng = (lng2 - lng1) * this.DEG_TO_RAD;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * this.DEG_TO_RAD) * Math.cos(lat2 * this.DEG_TO_RAD) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = this.EARTH_RADIUS * c / 1000; // Convert to kilometers
        
        return this.roundToPrecision(distance, 2);
    }
    
    /**
     * Calculate bearing (direction) from one point to another
     * @param {number} lat1 - Start point latitude
     * @param {number} lng1 - Start point longitude
     * @param {number} lat2 - End point latitude
     * @param {number} lng2 - End point longitude
     * @returns {number} Bearing in degrees (0-360)
     */
    calculateBearing(lat1, lng1, lat2, lng2) {
        const dLng = (lng2 - lng1) * this.DEG_TO_RAD;
        const lat1Rad = lat1 * this.DEG_TO_RAD;
        const lat2Rad = lat2 * this.DEG_TO_RAD;
        
        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
        
        let bearing = Math.atan2(y, x) * this.RAD_TO_DEG;
        bearing = (bearing + 360) % 360; // Normalize to 0-360
        
        return this.roundToPrecision(bearing, 1);
    }
    
    /**
     * Interpolate between two geographic points for smooth animation
     * @param {Object} start - Start position {lat, lng}
     * @param {Object} end - End position {lat, lng}
     * @param {number} progress - Interpolation progress (0-1)
     * @returns {Object} Interpolated position {lat, lng}
     */
    interpolatePosition(start, end, progress) {
        // Handle dateline crossing for longitude
        let startLng = start.lng;
        let endLng = end.lng;
        
        // Check if crossing dateline (shortest path)
        const lngDiff = endLng - startLng;
        if (Math.abs(lngDiff) > 180) {
            if (lngDiff > 0) {
                startLng += 360;
            } else {
                endLng += 360;
            }
        }
        
        // Linear interpolation
        const lat = start.lat + (end.lat - start.lat) * progress;
        let lng = startLng + (endLng - startLng) * progress;
        
        // Normalize longitude back to [-180, 180]
        lng = this.normalizeLongitude(lng);
        
        return {
            lat: this.roundToPrecision(lat, 6),
            lng: this.roundToPrecision(lng, 6)
        };
    }
    
    /**
     * Get the scale factor at a given latitude
     * Mercator projection has varying scale - accurate at equator, distorted at poles
     * @param {number} latitude - Latitude in decimal degrees
     * @returns {number} Scale factor (1.0 = no distortion)
     */
    getScaleFactor(latitude) {
        const latRad = Math.abs(latitude) * this.DEG_TO_RAD;
        return 1 / Math.cos(latRad);
    }
    
    /**
     * Get the area distortion factor at a given latitude
     * @param {number} latitude - Latitude in decimal degrees
     * @returns {number} Area distortion factor
     */
    getAreaDistortion(latitude) {
        const scaleFactor = this.getScaleFactor(latitude);
        return scaleFactor * scaleFactor;
    }
    
    /**
     * Check if coordinates are within valid bounds
     * @param {number} latitude - Latitude in decimal degrees
     * @param {number} longitude - Longitude in decimal degrees
     * @returns {boolean} True if coordinates are valid
     */
    isValidCoordinate(latitude, longitude) {
        return (
            typeof latitude === 'number' && 
            typeof longitude === 'number' &&
            !isNaN(latitude) && 
            !isNaN(longitude) &&
            latitude >= -90 && 
            latitude <= 90 &&
            longitude >= -180 && 
            longitude <= 180
        );
    }
    
    /**
     * Check if pixel coordinates are within canvas bounds
     * @param {number} x - X pixel coordinate
     * @param {number} y - Y pixel coordinate
     * @returns {boolean} True if coordinates are within bounds
     */
    isWithinBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    /**
     * Normalize longitude to the range [-180, 180]
     * @param {number} longitude - Longitude in decimal degrees
     * @returns {number} Normalized longitude
     */
    normalizeLongitude(longitude) {
        let normalized = longitude;
        while (normalized > 180) normalized -= 360;
        while (normalized < -180) normalized += 360;
        return normalized;
    }
    
    /**
     * Round number to specified decimal places
     * @param {number} value - Value to round
     * @param {number} precision - Number of decimal places
     * @returns {number} Rounded value
     */
    roundToPrecision(value, precision) {
        const factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    }
    
    /**
     * Get projection information and statistics
     * @returns {Object} Projection information
     */
    getProjectionInfo() {
        return {
            type: 'Mercator (Web Mercator)',
            epsg: 'EPSG:3857',
            datum: 'WGS84',
            dimensions: {
                width: this.width,
                height: this.height
            },
            bounds: {
                geographic: this.bounds,
                pixel: {
                    minX: 0,
                    maxX: this.width - 1,
                    minY: 0,
                    maxY: this.height - 1
                }
            },
            scale: {
                pixelsPerDegree: this.pixelsPerDegree,
                pixelsPerRadian: this.pixelsPerRadian
            },
            distortion: {
                equator: 1.0,
                at60deg: this.getScaleFactor(60),
                at80deg: this.getScaleFactor(80)
            }
        };
    }
    
    /**
     * Test projection accuracy with known coordinate pairs
     * @returns {Object} Test results
     */
    testProjectionAccuracy() {
        const testPoints = [
            { lat: 0, lng: 0, name: 'Equator/Prime Meridian' },
            { lat: 51.4769, lng: -0.0005, name: 'London' },
            { lat: 40.7128, lng: -74.0060, name: 'New York' },
            { lat: -33.8651, lng: 151.2099, name: 'Sydney' },
            { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
            { lat: 25.2048, lng: 55.2708, name: 'Dubai' }
        ];
        
        const results = [];
        
        for (const point of testPoints) {
            const projected = this.project(point.lat, point.lng);
            const unprojected = this.unproject(projected.x, projected.y);
            
            const latError = Math.abs(point.lat - unprojected.latitude);
            const lngError = Math.abs(point.lng - unprojected.longitude);
            
            results.push({
                name: point.name,
                original: { lat: point.lat, lng: point.lng },
                projected: { x: projected.x, y: projected.y },
                unprojected: { lat: unprojected.latitude, lng: unprojected.longitude },
                errors: {
                    latitude: this.roundToPrecision(latError, 8),
                    longitude: this.roundToPrecision(lngError, 8)
                },
                pixelAccuracy: latError < 0.001 && lngError < 0.001
            });
        }
        
        const accuratePoints = results.filter(r => r.pixelAccuracy).length;
        
        return {
            testPoints: results,
            summary: {
                totalTests: testPoints.length,
                accurateProjections: accuratePoints,
                accuracyPercentage: (accuratePoints / testPoints.length) * 100
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MercatorProjection;
}