/**
 * ISS Tracker Core Logic
 * Real-Time ISS Tracker with Mercator Projection
 * 
 * Coordinates the real-time tracking of the International Space Station
 * Handles API polling, position animation, and state management
 */

class ISSTracker {
    constructor(apiClient, audioManager) {
        this.apiClient = apiClient;
        this.audioManager = audioManager;
        
        // Tracking state
        this.isActive = false;
        this.isPaused = false;
        this.updateInterval = 2000; // 2 seconds default
        this.intervalId = null;
        
        // Position data
        this.currentPosition = null;
        this.previousPosition = null;
        this.targetPosition = null;
        this.interpolatedPosition = null;
        
        // Animation state
        this.animationProgress = 0;
        this.animationDuration = 1500; // 1.5 seconds
        this.animationStartTime = null;
        this.isAnimating = false;
        
        // Orbital path tracking
        this.orbitalPath = [];
        this.maxPathLength = 50;
        
        // Performance tracking
        this.updateCount = 0;
        this.errorCount = 0;
        this.lastUpdateTime = null;
        this.averageUpdateTime = 0;
        
        // Event callbacks
        this.callbacks = {
            onPositionUpdate: [],
            onError: [],
            onStatusChange: []
        };
        
        console.log('ISS Tracker initialized');
    }
    
    /**
     * Start tracking the ISS
     * @param {number} interval - Update interval in milliseconds
     */
    async startTracking(interval = this.updateInterval) {
        if (this.isActive) {
            console.warn('Tracking already active');
            return;
        }
        
        this.updateInterval = interval;
        this.isActive = true;
        this.isPaused = false;
        this.errorCount = 0;
        
        console.log(`Starting ISS tracking with ${interval}ms interval`);
        
        // Initial position fetch
        await this.fetchAndUpdatePosition();
        
        // Set up periodic updates
        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.fetchAndUpdatePosition();
            }
        }, this.updateInterval);
        
        this.notifyStatusChange('tracking_started');
    }
    
    /**
     * Stop tracking the ISS
     */
    stopTracking() {
        if (!this.isActive) {
            console.warn('Tracking not active');
            return;
        }
        
        this.isActive = false;
        this.isPaused = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('ISS tracking stopped');
        this.notifyStatusChange('tracking_stopped');
    }
    
    /**
     * Pause tracking (keeps interval but skips updates)
     */
    pauseTracking() {
        if (!this.isActive) {
            console.warn('Tracking not active');
            return;
        }
        
        this.isPaused = true;
        console.log('ISS tracking paused');
        this.notifyStatusChange('tracking_paused');
    }
    
    /**
     * Resume tracking
     */
    resumeTracking() {
        if (!this.isActive || !this.isPaused) {
            console.warn('Cannot resume - tracking not paused');
            return;
        }
        
        this.isPaused = false;
        console.log('ISS tracking resumed');
        this.notifyStatusChange('tracking_resumed');
    }
    
    /**
     * Fetch and update ISS position
     */
    async fetchAndUpdatePosition() {
        const startTime = performance.now();
        
        try {
            const positionData = await this.apiClient.fetchISSPosition();
            
            // Validate position data
            if (!this.isValidPosition(positionData)) {
                throw new Error('Invalid position data received');
            }
            
            // Update positions
            this.previousPosition = this.currentPosition;
            this.targetPosition = {
                lat: positionData.latitude,
                lng: positionData.longitude,
                alt: positionData.altitude,
                velocity: positionData.velocity,
                timestamp: positionData.timestamp,
                source: positionData.source
            };
            
            // Start animation to new position
            this.startPositionAnimation();
            
            // Update orbital path
            this.updateOrbitalPath(this.targetPosition);
            
            // Check for grid crossings (audio feedback)
            if (this.audioManager && this.currentPosition) {
                this.audioManager.checkGridCrossing(
                    this.targetPosition.lat,
                    this.targetPosition.lng
                );
            }
            
            // Update performance metrics
            const updateTime = performance.now() - startTime;
            this.updatePerformanceMetrics(updateTime, true);
            
            // Notify callbacks
            this.notifyPositionUpdate(this.targetPosition);
            
            console.log(`ISS position updated: ${this.targetPosition.lat.toFixed(4)}, ${this.targetPosition.lng.toFixed(4)}`);
            
        } catch (error) {
            console.error('Failed to fetch ISS position:', error);
            
            // Update error metrics
            this.errorCount++;
            const updateTime = performance.now() - startTime;
            this.updatePerformanceMetrics(updateTime, false);
            
            // Notify error callbacks
            this.notifyError(error);
            
            // Handle consecutive errors
            if (this.errorCount >= 5) {
                console.warn('Too many consecutive errors, pausing tracking');
                this.pauseTracking();
            }
        }
    }
    
    /**
     * Start smooth animation to new position
     */
    startPositionAnimation() {
        if (!this.previousPosition) {
            // No previous position, jump directly
            this.currentPosition = { ...this.targetPosition };
            this.interpolatedPosition = { ...this.targetPosition };
            return;
        }
        
        this.isAnimating = true;
        this.animationProgress = 0;
        this.animationStartTime = performance.now();
        
        // Start animation loop
        this.animateToPosition();
    }
    
    /**
     * Animate smoothly to target position
     */
    animateToPosition() {
        if (!this.isAnimating || !this.targetPosition || !this.previousPosition) {
            return;
        }
        
        const elapsed = performance.now() - this.animationStartTime;
        this.animationProgress = Math.min(elapsed / this.animationDuration, 1);
        
        // Use easing function for smooth animation
        const easedProgress = this.easeInOutCubic(this.animationProgress);
        
        // Interpolate position using great circle path
        this.interpolatedPosition = this.interpolateGreatCircle(
            this.previousPosition,
            this.targetPosition,
            easedProgress
        );
        
        // Update current position
        this.currentPosition = { ...this.interpolatedPosition };
        
        if (this.animationProgress < 1) {
            // Continue animation
            requestAnimationFrame(() => this.animateToPosition());
        } else {
            // Animation complete
            this.isAnimating = false;
            this.currentPosition = { ...this.targetPosition };
            this.interpolatedPosition = { ...this.targetPosition };
        }
    }
    
    /**
     * Interpolate between two positions using great circle path
     * @param {Object} start - Start position {lat, lng}
     * @param {Object} end - End position {lat, lng}
     * @param {number} progress - Progress from 0 to 1
     * @returns {Object} Interpolated position
     */
    interpolateGreatCircle(start, end, progress) {
        // Convert to radians
        const lat1 = start.lat * Math.PI / 180;
        const lng1 = start.lng * Math.PI / 180;
        const lat2 = end.lat * Math.PI / 180;
        const lng2 = end.lng * Math.PI / 180;
        
        // Calculate angular distance
        const d = Math.acos(
            Math.sin(lat1) * Math.sin(lat2) + 
            Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
        );
        
        if (d === 0) {
            // Same position
            return { ...start };
        }
        
        // Interpolate along great circle
        const a = Math.sin((1 - progress) * d) / Math.sin(d);
        const b = Math.sin(progress * d) / Math.sin(d);
        
        const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
        const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
        const z = a * Math.sin(lat1) + b * Math.sin(lat2);
        
        // Convert back to lat/lng
        const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
        const lng = Math.atan2(y, x) * 180 / Math.PI;
        
        // Interpolate other properties linearly
        const alt = start.alt && end.alt ? 
            start.alt + (end.alt - start.alt) * progress : 
            end.alt || start.alt;
            
        const velocity = start.velocity && end.velocity ?
            start.velocity + (end.velocity - start.velocity) * progress :
            end.velocity || start.velocity;
        
        return {
            lat: lat,
            lng: lng,
            alt: alt,
            velocity: velocity,
            timestamp: end.timestamp,
            source: end.source
        };
    }
    
    /**
     * Easing function for smooth animation
     * @param {number} t - Progress from 0 to 1
     * @returns {number} Eased progress
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Update orbital path with new position
     * @param {Object} position - New position to add
     */
    updateOrbitalPath(position) {
        this.orbitalPath.push({
            lat: position.lat,
            lng: position.lng,
            timestamp: position.timestamp
        });
        
        // Remove old positions to maintain max length
        while (this.orbitalPath.length > this.maxPathLength) {
            this.orbitalPath.shift();
        }
    }
    
    /**
     * Validate position data
     * @param {Object} position - Position data to validate
     * @returns {boolean} True if valid
     */
    isValidPosition(position) {
        return (
            position &&
            typeof position.latitude === 'number' &&
            typeof position.longitude === 'number' &&
            !isNaN(position.latitude) &&
            !isNaN(position.longitude) &&
            position.latitude >= -90 &&
            position.latitude <= 90 &&
            position.longitude >= -180 &&
            position.longitude <= 180
        );
    }
    
    /**
     * Update performance metrics
     * @param {number} updateTime - Time taken for update in ms
     * @param {boolean} success - Whether update was successful
     */
    updatePerformanceMetrics(updateTime, success) {
        this.updateCount++;
        this.lastUpdateTime = updateTime;
        
        if (success) {
            // Update average (rolling average)
            this.averageUpdateTime = (this.averageUpdateTime * 0.9) + (updateTime * 0.1);
        }
    }
    
    /**
     * Change update interval
     * @param {number} interval - New interval in milliseconds
     */
    setUpdateInterval(interval) {
        const wasActive = this.isActive;
        
        if (wasActive) {
            this.stopTracking();
        }
        
        this.updateInterval = interval;
        console.log(`Update interval changed to ${interval}ms`);
        
        if (wasActive) {
            this.startTracking(interval);
        }
    }
    
    /**
     * Get current tracking status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isActive: this.isActive,
            isPaused: this.isPaused,
            updateInterval: this.updateInterval,
            currentPosition: this.currentPosition,
            previousPosition: this.previousPosition,
            targetPosition: this.targetPosition,
            isAnimating: this.isAnimating,
            animationProgress: this.animationProgress,
            orbitalPathLength: this.orbitalPath.length,
            updateCount: this.updateCount,
            errorCount: this.errorCount,
            lastUpdateTime: this.lastUpdateTime,
            averageUpdateTime: this.averageUpdateTime,
            apiStats: this.apiClient ? this.apiClient.getStats() : null
        };
    }
    
    /**
     * Get orbital path data
     * @returns {Array} Array of position objects
     */
    getOrbitalPath() {
        return [...this.orbitalPath];
    }
    
    /**
     * Clear orbital path
     */
    clearOrbitalPath() {
        this.orbitalPath = [];
        console.log('Orbital path cleared');
    }
    
    /**
     * Retry connection after errors
     */
    async retryConnection() {
        console.log('Retrying ISS tracking connection...');
        
        this.errorCount = 0;
        
        if (this.apiClient && this.apiClient.resetCircuitBreaker) {
            this.apiClient.resetCircuitBreaker();
        }
        
        if (this.isActive && this.isPaused) {
            this.resumeTracking();
        } else if (!this.isActive) {
            await this.startTracking();
        }
    }
    
    /**
     * Register callback for position updates
     * @param {Function} callback - Callback function
     */
    onPositionUpdate(callback) {
        this.callbacks.onPositionUpdate.push(callback);
    }
    
    /**
     * Register callback for errors
     * @param {Function} callback - Callback function
     */
    onError(callback) {
        this.callbacks.onError.push(callback);
    }
    
    /**
     * Register callback for status changes
     * @param {Function} callback - Callback function
     */
    onStatusChange(callback) {
        this.callbacks.onStatusChange.push(callback);
    }
    
    /**
     * Notify position update callbacks
     * @param {Object} position - Position data
     */
    notifyPositionUpdate(position) {
        this.callbacks.onPositionUpdate.forEach(callback => {
            try {
                callback(position);
            } catch (error) {
                console.error('Error in position update callback:', error);
            }
        });
    }
    
    /**
     * Notify error callbacks
     * @param {Error} error - Error object
     */
    notifyError(error) {
        this.callbacks.onError.forEach(callback => {
            try {
                callback(error);
            } catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });
    }
    
    /**
     * Notify status change callbacks
     * @param {string} status - Status change type
     */
    notifyStatusChange(status) {
        this.callbacks.onStatusChange.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error in status change callback:', error);
            }
        });
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.stopTracking();
        
        // Clear callbacks
        this.callbacks.onPositionUpdate = [];
        this.callbacks.onError = [];
        this.callbacks.onStatusChange = [];
        
        console.log('ISS Tracker destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ISSTracker;
}