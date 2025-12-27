/**
 * UI Controller for ISS Tracker
 * Real-Time ISS Tracker with Mercator Projection
 * 
 * Manages all user interface interactions and updates
 */

class UIController {
    constructor(app) {
        this.app = app;
        
        // UI element references
        this.elements = {};
        this.initializeElements();
        
        // Session tracking
        this.sessionStartTime = Date.now();
        this.sessionTimer = null;
        
        // Performance monitoring
        this.performanceUpdateInterval = null;
        
        // Initialize UI
        this.setupEventListeners();
        this.startSessionTimer();
        this.startPerformanceMonitoring();
        
        console.log('UI Controller initialized');
    }
    
    /**
     * Initialize UI element references
     */
    initializeElements() {
        // Control elements
        this.elements.trackingToggle = document.getElementById('tracking-toggle');
        this.elements.centerIss = document.getElementById('center-iss');
        this.elements.updateFrequency = document.getElementById('update-frequency');
        
        // Display options
        this.elements.showOrbitPath = document.getElementById('show-orbit-path');
        this.elements.showGrid = document.getElementById('show-grid');
        this.elements.showCoordinates = document.getElementById('show-coordinates');
        
        // Audio controls
        this.elements.audioEnabled = document.getElementById('audio-enabled');
        this.elements.muteBtn = document.getElementById('mute-btn');
        this.elements.volumeSlider = document.getElementById('volume-slider');
        this.elements.volumeDisplay = document.getElementById('volume-display');
        
        // Display elements
        this.elements.latDisplay = document.getElementById('lat-display');
        this.elements.lngDisplay = document.getElementById('lng-display');
        this.elements.altDisplay = document.getElementById('alt-display');
        this.elements.speedDisplay = document.getElementById('speed-display');
        this.elements.lastUpdate = document.getElementById('last-update');
        this.elements.nextUpdate = document.getElementById('next-update');
        this.elements.connectionStatus = document.getElementById('connection-status');
        
        // Performance elements
        this.elements.fpsDisplay = document.getElementById('fps-display');
        this.elements.apiResponseTime = document.getElementById('api-response-time');
        this.elements.memoryUsage = document.getElementById('memory-usage');
        
        // Debug elements
        this.elements.debugApiEndpoint = document.getElementById('debug-api-endpoint');
        this.elements.debugProjectionError = document.getElementById('debug-projection-error');
        this.elements.debugUpdateErrors = document.getElementById('debug-update-errors');
        this.elements.clearDebug = document.getElementById('clear-debug');
        
        // Session timer
        this.elements.sessionTime = document.getElementById('session-time');
        
        console.log('UI elements initialized');
    }
    
    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // Tracking toggle
        if (this.elements.trackingToggle) {
            this.elements.trackingToggle.addEventListener('click', () => {
                this.toggleTracking();
            });
        }
        
        // Center ISS button
        if (this.elements.centerIss) {
            this.elements.centerIss.addEventListener('click', () => {
                this.centerOnISS();
            });
        }
        
        // Update frequency selector
        if (this.elements.updateFrequency) {
            this.elements.updateFrequency.addEventListener('change', (e) => {
                this.setUpdateFrequency(parseInt(e.target.value));
            });
        }
        
        // Display options
        if (this.elements.showOrbitPath) {
            this.elements.showOrbitPath.addEventListener('change', (e) => {
                this.app.config.showPath = e.target.checked;
            });
        }
        
        if (this.elements.showGrid) {
            this.elements.showGrid.addEventListener('change', (e) => {
                this.app.config.showGrid = e.target.checked;
            });
        }
        
        if (this.elements.showCoordinates) {
            this.elements.showCoordinates.addEventListener('change', (e) => {
                this.app.config.showCoordinates = e.target.checked;
                const coordDisplay = document.querySelector('.coordinates-display');
                if (coordDisplay) {
                    coordDisplay.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }
        
        // Audio controls
        if (this.elements.audioEnabled) {
            this.elements.audioEnabled.addEventListener('change', (e) => {
                this.app.config.audioEnabled = e.target.checked;
                if (this.app.audioManager) {
                    this.app.audioManager.setEnabled(e.target.checked);
                }
            });
        }
        
        if (this.elements.muteBtn) {
            this.elements.muteBtn.addEventListener('click', () => {
                this.toggleAudioMute();
            });
        }
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(parseInt(e.target.value));
            });
        }
        
        // Debug controls
        if (this.elements.clearDebug) {
            this.elements.clearDebug.addEventListener('click', () => {
                this.clearDebugLog();
            });
        }
        
        // Keyboard shortcuts info
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return;
            
            switch (e.code) {
                case 'KeyH':
                    e.preventDefault();
                    this.showKeyboardShortcuts();
                    break;
                case 'KeyD':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleDebugPanel();
                    }
                    break;
            }
        });
        
        console.log('UI event listeners set up');
    }
    
    /**
     * Toggle ISS tracking
     */
    async toggleTracking() {
        if (!this.app.tracker) {
            console.error('Tracker not initialized');
            return;
        }
        
        const btn = this.elements.trackingToggle;
        const btnIcon = btn?.querySelector('.btn-icon');
        const btnText = btn?.querySelector('.btn-text');
        
        if (this.app.isTracking) {
            // Stop tracking
            this.app.tracker.stopTracking();
            this.app.isTracking = false;
            
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
            if (btnIcon) btnIcon.textContent = '▶️';
            if (btnText) btnText.textContent = 'Start Tracking';
            if (this.elements.centerIss) {
                this.elements.centerIss.disabled = true;
            }
            
            this.updateConnectionStatus('DISCONNECTED');
            
        } else {
            // Start tracking
            if (btn) {
                btn.disabled = true;
                if (btnText) btnText.textContent = 'Starting...';
            }
            
            try {
                await this.app.tracker.startTracking(this.app.config.updateInterval);
                this.app.isTracking = true;
                
                if (btn) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                    btn.disabled = false;
                }
                if (btnIcon) btnIcon.textContent = '⏸️';
                if (btnText) btnText.textContent = 'Stop Tracking';
                if (this.elements.centerIss) {
                    this.elements.centerIss.disabled = false;
                }
                
                this.updateConnectionStatus('CONNECTED');
                
            } catch (error) {
                console.error('Failed to start tracking:', error);
                
                if (btn) {
                    btn.disabled = false;
                    if (btnText) btnText.textContent = 'Start Tracking';
                }
                
                this.updateConnectionStatus('ERROR');
                this.showError('Tracking Error', error.message);
            }
        }
    }
    
    /**
     * Center map view on ISS position
     */
    centerOnISS() {
        if (this.app.issPosition) {
            console.log('Centering on ISS:', this.app.issPosition);
            // Implementation would depend on pan/zoom functionality
            // For now, just provide user feedback
            this.showNotification('Centered on ISS position');
        }
    }
    
    /**
     * Set update frequency
     * @param {number} frequency - Update frequency in milliseconds
     */
    setUpdateFrequency(frequency) {
        this.app.config.updateInterval = frequency;
        
        if (this.app.tracker && this.app.isTracking) {
            this.app.tracker.setUpdateInterval(frequency);
        }
        
        console.log(`Update frequency set to ${frequency}ms`);
    }
    
    /**
     * Toggle audio mute
     */
    toggleAudioMute() {
        if (!this.app.audioManager) return;
        
        const isMuted = this.app.audioManager.toggleMute();
        const btn = this.elements.muteBtn;
        
        if (btn) {
            btn.textContent = isMuted ? '🔇' : '🔊';
            btn.setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');
        }
    }
    
    /**
     * Set audio volume
     * @param {number} volume - Volume level (0-100)
     */
    setVolume(volume) {
        const normalizedVolume = volume / 100;
        this.app.config.volume = normalizedVolume;
        
        if (this.app.audioManager) {
            this.app.audioManager.setVolume(normalizedVolume);
        }
        
        if (this.elements.volumeDisplay) {
            this.elements.volumeDisplay.textContent = `${volume}%`;
        }
    }
    
    /**
     * Update all display elements
     */
    updateDisplays() {
        this.updateCoordinateDisplay();
        this.updatePerformanceDisplay();
        this.updateConnectionDisplay();
        this.updateDebugDisplay();
    }
    
    /**
     * Update coordinate display
     */
    updateCoordinateDisplay() {
        const position = this.app.issPosition;
        
        if (position) {
            if (this.elements.latDisplay) {
                this.elements.latDisplay.textContent = `${position.lat.toFixed(4)}°`;
            }
            if (this.elements.lngDisplay) {
                this.elements.lngDisplay.textContent = `${position.lng.toFixed(4)}°`;
            }
            if (this.elements.altDisplay) {
                this.elements.altDisplay.textContent = position.alt ? 
                    `${position.alt.toFixed(1)} km` : '--';
            }
            if (this.elements.speedDisplay) {
                this.elements.speedDisplay.textContent = position.velocity ? 
                    `${position.velocity.toFixed(0)} km/h` : '--';
            }
            
            // Update last update time
            if (this.elements.lastUpdate) {
                const lastUpdate = new Date(position.timestamp * 1000);
                this.elements.lastUpdate.textContent = lastUpdate.toLocaleTimeString();
            }
            
            // Calculate next update time
            if (this.elements.nextUpdate && this.app.isTracking) {
                const nextUpdate = new Date(Date.now() + this.app.config.updateInterval);
                this.elements.nextUpdate.textContent = nextUpdate.toLocaleTimeString();
            }
        } else {
            // No position data
            if (this.elements.latDisplay) this.elements.latDisplay.textContent = '--°';
            if (this.elements.lngDisplay) this.elements.lngDisplay.textContent = '--°';
            if (this.elements.altDisplay) this.elements.altDisplay.textContent = '-- km';
            if (this.elements.speedDisplay) this.elements.speedDisplay.textContent = '-- km/h';
            if (this.elements.lastUpdate) this.elements.lastUpdate.textContent = '--';
            if (this.elements.nextUpdate) this.elements.nextUpdate.textContent = '--';
        }
    }
    
    /**
     * Update performance display
     */
    updatePerformanceDisplay() {
        if (this.elements.fpsDisplay) {
            this.elements.fpsDisplay.textContent = this.app.performance.fps || '--';
        }
        
        if (this.elements.apiResponseTime && this.app.tracker) {
            const avgTime = this.app.tracker.averageUpdateTime;
            this.elements.apiResponseTime.textContent = avgTime ? 
                `${avgTime.toFixed(0)}ms` : '--ms';
        }
        
        if (this.elements.memoryUsage) {
            this.elements.memoryUsage.textContent = this.app.performance.memoryUsage ? 
                `${this.app.performance.memoryUsage}MB` : '--MB';
        }
    }
    
    /**
     * Update connection status display
     */
    updateConnectionDisplay() {
        if (!this.elements.connectionStatus) return;
        
        const status = this.elements.connectionStatus;
        
        if (this.app.isTracking && this.app.issPosition) {
            status.textContent = 'CONNECTED';
            status.className = 'info-value status-indicator connected';
        } else if (this.app.isTracking) {
            status.textContent = 'CONNECTING';
            status.className = 'info-value status-indicator connecting';
        } else {
            status.textContent = 'DISCONNECTED';
            status.className = 'info-value status-indicator disconnected';
        }
    }
    
    /**
     * Update debug display
     */
    updateDebugDisplay() {
        if (this.elements.debugApiEndpoint && this.app.apiClient) {
            const stats = this.app.apiClient.getStats();
            this.elements.debugApiEndpoint.textContent = stats.currentEndpoint;
        }
        
        if (this.elements.debugProjectionError && this.app.projection) {
            // Calculate projection accuracy
            const testResult = this.app.projection.testProjectionAccuracy();
            const avgError = testResult.testPoints.reduce((sum, point) => 
                sum + point.errors.latitude + point.errors.longitude, 0) / testResult.testPoints.length;
            this.elements.debugProjectionError.textContent = `${(avgError * 111000).toFixed(1)}m`;
        }
        
        if (this.elements.debugUpdateErrors && this.app.tracker) {
            this.elements.debugUpdateErrors.textContent = this.app.tracker.errorCount;
        }
    }
    
    /**
     * Update connection status
     * @param {string} status - Status type
     */
    updateConnectionStatus(status) {
        if (!this.elements.connectionStatus) return;
        
        const statusElement = this.elements.connectionStatus;
        statusElement.textContent = status;
        statusElement.className = `info-value status-indicator ${status.toLowerCase()}`;
    }
    
    /**
     * Show error notification
     * @param {string} title - Error title
     * @param {string} message - Error message
     */
    showError(title, message) {
        const modal = document.getElementById('error-modal');
        const titleElement = document.getElementById('error-title');
        const messageElement = document.getElementById('error-message');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        if (modal) modal.classList.add('active');
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     */
    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-cosmic-blue);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    /**
     * Start session timer
     */
    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            const elapsed = Date.now() - this.sessionStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            if (this.elements.sessionTime) {
                this.elements.sessionTime.textContent = 
                    `Session: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        this.performanceUpdateInterval = setInterval(() => {
            this.updatePerformanceDisplay();
        }, 1000);
    }
    
    /**
     * Clear debug log
     */
    clearDebugLog() {
        if (this.app.apiClient) {
            const stats = this.app.apiClient.getStats();
            stats.errors = [];
        }
        
        this.showNotification('Debug log cleared');
    }
    
    /**
     * Toggle debug panel visibility
     */
    toggleDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Show keyboard shortcuts
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            'Space - Toggle tracking',
            'F - Toggle fullscreen',
            'I - Show info',
            'G - Toggle grid',
            'P - Toggle orbital path',
            'M - Toggle audio mute',
            'H - Show this help',
            'Ctrl+D - Toggle debug panel',
            'Esc - Close modals'
        ];
        
        alert('Keyboard Shortcuts:\n\n' + shortcuts.join('\n'));
    }
    
    /**
     * Clean up UI resources
     */
    destroy() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        if (this.performanceUpdateInterval) {
            clearInterval(this.performanceUpdateInterval);
        }
        
        console.log('UI Controller destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}