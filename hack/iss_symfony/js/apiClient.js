/**
 * API Client for ISS Tracking
 * Real-Time ISS Tracker with Mercator Projection
 * 
 * Handles communication with ISS tracking APIs including:
 * - Primary: Open Notify API
 * - Backup: Where the ISS at? API
 * - Error handling and automatic failover
 * - Request queuing and rate limiting
 * - Response validation and transformation
 */

class APIClient {
    /**
     * Initialize API client with configuration
     * @param {Object} config - Configuration object
     */
    constructor(config) {
        this.config = {
            primary: {
                url: 'https://api.wheretheiss.at/v1/satellites/25544',
                timeout: 3000,
                retries: 3,
                retryDelay: 1000,
                rateLimit: 1000, // 1 request per second
                ...config.primary
            },
            backup: {
                url: 'https://api.wheretheiss.at/v1/satellites/25544',
                timeout: 5000,
                retries: 2,
                retryDelay: 1500,
                rateLimit: 1000, // 1 second between requests
                ...config.backup
            }
        };
        
        // State management
        this.currentEndpoint = 'primary';
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        this.failureCount = 0;
        this.circuitBreakerOpen = false;
        this.circuitBreakerTimeout = null;
        
        // Statistics
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            responseTimeSum: 0,
            endpointUsage: {
                primary: 0,
                backup: 0
            },
            errors: []
        };
        
        // Request cache for offline fallback
        this.cache = {
            lastValidResponse: null,
            timestamp: null,
            maxAge: 30000 // 30 seconds max age for cached data
        };
        
        console.log('API Client initialized');
        console.log('Primary endpoint:', this.config.primary.url);
        console.log('Backup endpoint:', this.config.backup.url);
    }
    
    /**
     * Fetch current ISS position
     * @returns {Promise<Object>} ISS position data
     */
    async fetchISSPosition() {
        const startTime = performance.now();
        
        try {
            this.stats.totalRequests++;
            
            // Check circuit breaker
            if (this.circuitBreakerOpen) {
                throw new Error('Circuit breaker is open');
            }
            
            // Apply rate limiting
            await this.applyRateLimit();
            
            // Attempt request with current endpoint
            let response = await this.makeRequest(this.currentEndpoint);
            
            // Update statistics
            const responseTime = performance.now() - startTime;
            this.updateStats(true, responseTime);
            
            // Cache successful response
            this.cacheResponse(response);
            
            // Reset failure count on success
            this.failureCount = 0;
            
            return response;
            
        } catch (error) {
            console.error('API request failed:', error.message);
            
            // Update statistics
            const responseTime = performance.now() - startTime;
            this.updateStats(false, responseTime, error);
            
            // Increment failure count
            this.failureCount++;
            
            // Try backup endpoint if primary failed
            if (this.currentEndpoint === 'primary') {
                console.log('Switching to backup endpoint...');
                this.currentEndpoint = 'backup';
                
                try {
                    const backupResponse = await this.makeRequest('backup');
                    this.updateStats(true, performance.now() - startTime);
                    this.cacheResponse(backupResponse);
                    return backupResponse;
                } catch (backupError) {
                    console.error('Backup endpoint also failed:', backupError.message);
                    this.updateStats(false, performance.now() - startTime, backupError);
                }
            }
            
            // If all endpoints fail, try cached data
            const cachedData = this.getCachedData();
            if (cachedData) {
                console.warn('Using cached data due to API failures');
                return cachedData;
            }
            
            // Try demo mode as last resort
            console.warn('All APIs failed, switching to demo mode');
            return this.getDemoData();
        }
    }
    
    /**
     * Get demo data when all APIs fail
     * @returns {Object} Demo ISS position data
     */
    getDemoData() {
        // Simulate ISS orbit for demo purposes
        const now = Date.now();
        const orbitPeriod = 90 * 60 * 1000; // 90 minutes in milliseconds
        const phase = (now % orbitPeriod) / orbitPeriod * 2 * Math.PI;
        
        // Simple orbital simulation
        const lat = 51.5 * Math.sin(phase * 0.95) * Math.cos(phase * 1.1);
        const lng = ((now / 1000 / 60) % 360) - 180; // Complete orbit every minute for demo
        
        return {
            latitude: lat,
            longitude: lng,
            altitude: 408, // Typical ISS altitude
            velocity: 27600, // Typical ISS velocity
            timestamp: Math.floor(now / 1000),
            source: 'demo',
            demo: true
        };
    }
    
    /**
     * Make HTTP request to specified endpoint
     * @param {string} endpoint - 'primary' or 'backup'
     * @returns {Promise<Object>} Parsed response data
     */
    async makeRequest(endpoint) {
        const config = this.config[endpoint];
        const controller = new AbortController();
        
        // Set request timeout
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, config.timeout);
        
        try {
            const response = await fetch(config.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new APIError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    'HTTP_ERROR',
                    null,
                    response.status
                );
            }
            
            const data = await response.json();
            
            // Validate and transform response
            const validatedData = this.validateResponse(data, endpoint);
            
            // Update endpoint usage stats
            this.stats.endpointUsage[endpoint]++;
            
            return validatedData;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', 'TIMEOUT', error);
            }
            
            if (error instanceof APIError) {
                throw error;
            }
            
            throw new APIError(
                `Network error: ${error.message}`,
                'NETWORK_ERROR',
                error
            );
        }
    }
    
    /**
     * Validate and transform API response
     * @param {Object} data - Raw API response
     * @param {string} endpoint - Endpoint type
     * @returns {Object} Validated and normalized data
     */
    validateResponse(data, endpoint) {
        let validated;
        
        if (endpoint === 'primary') {
            // Where the ISS at API format (now primary)
            validated = this.validateWhereTheISSResponse(data);
        } else if (endpoint === 'backup') {
            // WhereTheISS API format (same as primary)
            validated = this.validateWhereTheISSResponse(data);
        } else {
            throw new APIError('Unknown endpoint type', 'UNKNOWN_ENDPOINT');
        }
        
        // Additional validation
        if (!this.isValidCoordinates(validated.latitude, validated.longitude)) {
            throw new APIError(
                'Invalid coordinates in API response',
                'INVALID_COORDINATES',
                null,
                null,
                validated
            );
        }
        
        // Add metadata
        validated.source = endpoint;
        validated.receivedAt = Date.now();
        
        return validated;
    }
    
    /**
     * Validate Open Notify API response
     * @param {Object} data - Raw response data
     * @returns {Object} Validated data
     */
    validateOpenNotifyResponse(data) {
        if (!data || typeof data !== 'object') {
            throw new APIError('Invalid response format', 'INVALID_FORMAT');
        }
        
        if (data.message !== 'success') {
            throw new APIError(
                `API returned error: ${data.message}`,
                'API_ERROR',
                null,
                null,
                data
            );
        }
        
        if (!data.iss_position || typeof data.iss_position !== 'object') {
            throw new APIError('Missing ISS position data', 'MISSING_DATA');
        }
        
        const { latitude, longitude } = data.iss_position;
        
        return {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            altitude: null, // Not provided by Open Notify
            velocity: null, // Not provided by Open Notify
            timestamp: data.timestamp || Math.floor(Date.now() / 1000),
            visibility: null
        };
    }
    
    /**
     * Validate Where the ISS at API response
     * @param {Object} data - Raw response data
     * @returns {Object} Validated data
     */
    validateWhereTheISSResponse(data) {
        if (!data || typeof data !== 'object') {
            throw new APIError('Invalid response format', 'INVALID_FORMAT');
        }
        
        if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
            throw new APIError('Missing or invalid coordinate data', 'MISSING_DATA');
        }
        
        return {
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: data.altitude || null,
            velocity: data.velocity || null,
            timestamp: data.timestamp || Math.floor(Date.now() / 1000),
            visibility: data.visibility || null
        };
    }
    
    /**
     * Check if coordinates are valid
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {boolean} True if valid
     */
    isValidCoordinates(lat, lng) {
        return (
            typeof lat === 'number' && 
            typeof lng === 'number' &&
            !isNaN(lat) && 
            !isNaN(lng) &&
            lat >= -90 && 
            lat <= 90 &&
            lng >= -180 && 
            lng <= 180
        );
    }
    
    /**
     * Apply rate limiting based on endpoint configuration
     * @returns {Promise<void>}
     */
    async applyRateLimit() {
        const config = this.config[this.currentEndpoint];
        
        if (!config.rateLimit) {
            return; // No rate limit
        }
        
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        const minInterval = config.rateLimit;
        
        if (timeSinceLastRequest < minInterval) {
            const delay = minInterval - timeSinceLastRequest;
            console.log(`Rate limiting: waiting ${delay}ms`);
            await this.sleep(delay);
        }
        
        this.lastRequestTime = Date.now();
    }
    
    /**
     * Cache successful response for offline fallback
     * @param {Object} data - Response data to cache
     */
    cacheResponse(data) {
        this.cache.lastValidResponse = { ...data };
        this.cache.timestamp = Date.now();
    }
    
    /**
     * Get cached data if available and not too old
     * @returns {Object|null} Cached data or null
     */
    getCachedData() {
        if (!this.cache.lastValidResponse || !this.cache.timestamp) {
            return null;
        }
        
        const age = Date.now() - this.cache.timestamp;
        if (age > this.cache.maxAge) {
            console.warn('Cached data is too old, discarding');
            this.cache.lastValidResponse = null;
            this.cache.timestamp = null;
            return null;
        }
        
        // Add cache metadata
        const cachedData = { ...this.cache.lastValidResponse };
        cachedData.cached = true;
        cachedData.cacheAge = age;
        
        return cachedData;
    }
    
    /**
     * Update request statistics
     * @param {boolean} success - Whether request was successful
     * @param {number} responseTime - Response time in milliseconds
     * @param {Error} error - Error object if failed
     */
    updateStats(success, responseTime, error = null) {
        if (success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
            
            if (error) {
                this.stats.errors.push({
                    timestamp: Date.now(),
                    message: error.message,
                    type: error.code || 'UNKNOWN',
                    endpoint: this.currentEndpoint
                });
                
                // Keep only last 10 errors
                if (this.stats.errors.length > 10) {
                    this.stats.errors = this.stats.errors.slice(-10);
                }
            }
        }
        
        // Update average response time
        this.stats.responseTimeSum += responseTime;
        this.stats.averageResponseTime = this.stats.responseTimeSum / this.stats.totalRequests;
    }
    
    /**
     * Open circuit breaker to prevent cascade failures
     */
    openCircuitBreaker() {
        console.warn('Opening circuit breaker due to repeated failures');
        this.circuitBreakerOpen = true;
        
        // Auto-reset circuit breaker after 30 seconds
        this.circuitBreakerTimeout = setTimeout(() => {
            console.log('Resetting circuit breaker');
            this.circuitBreakerOpen = false;
            this.failureCount = 0;
            this.currentEndpoint = 'primary'; // Reset to primary
        }, 30000);
    }
    
    /**
     * Manually reset circuit breaker and retry connection
     */
    resetCircuitBreaker() {
        console.log('Manually resetting circuit breaker');
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
        this.currentEndpoint = 'primary';
        
        if (this.circuitBreakerTimeout) {
            clearTimeout(this.circuitBreakerTimeout);
            this.circuitBreakerTimeout = null;
        }
    }
    
    /**
     * Get current client statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            currentEndpoint: this.currentEndpoint,
            circuitBreakerOpen: this.circuitBreakerOpen,
            failureCount: this.failureCount,
            successRate: this.stats.totalRequests > 0 
                ? (this.stats.successfulRequests / this.stats.totalRequests) * 100 
                : 0,
            cache: {
                hasData: !!this.cache.lastValidResponse,
                age: this.cache.timestamp ? Date.now() - this.cache.timestamp : null
            }
        };
    }
    
    /**
     * Switch to backup endpoint manually
     */
    switchToBackup() {
        console.log('Manually switching to backup endpoint');
        this.currentEndpoint = 'backup';
    }
    
    /**
     * Switch back to primary endpoint
     */
    switchToPrimary() {
        console.log('Switching back to primary endpoint');
        this.currentEndpoint = 'primary';
    }
    
    /**
     * Sleep utility for delays
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (this.circuitBreakerTimeout) {
            clearTimeout(this.circuitBreakerTimeout);
        }
        
        console.log('API Client destroyed');
    }
}

/**
 * Custom error class for API-related errors
 */
class APIError extends Error {
    constructor(message, code, originalError = null, httpStatus = null, responseData = null) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.originalError = originalError;
        this.httpStatus = httpStatus;
        this.responseData = responseData;
        this.timestamp = Date.now();
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            httpStatus: this.httpStatus,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, APIError };
}