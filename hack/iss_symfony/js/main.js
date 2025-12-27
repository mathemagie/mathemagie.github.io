/**
 * ISS Tracker - Main Application Entry Point
 * Real-Time ISS Tracker with Mercator Projection
 * 
 * This file initializes the p5.js canvas and orchestrates all application components
 */

// Global application state
let app = {
    // Core components
    projection: null,
    apiClient: null,
    audioManager: null,
    tracker: null,
    ui: null,
    
    // Canvas and rendering
    canvas: null,
    mapWidth: 0,
    mapHeight: 0,
    
    // ISS tracking state
    issPosition: { lat: 0, lng: 0, alt: 0, velocity: 0 },
    previousPosition: null,
    targetPosition: null,
    orbitalPath: [],
    isTracking: false,
    
    // Performance monitoring
    performance: {
        fps: 0,
        frameCount: 0,
        lastTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0
    },
    
    // Configuration
    config: {
        updateInterval: 2000,
        maxPathLength: 50,
        animationDuration: 1000,
        showGrid: true,
        showPath: true,
        showCoordinates: true,
        audioEnabled: true,
        volume: 0.7
    },
    
    // Error handling
    errors: {
        count: 0,
        lastError: null,
        recovery: false
    }
};

// World map outline coordinates (simplified for performance)
const worldMapOutline = [
    // Continental outlines - simplified coordinates
    // North America
    [[-170, 70], [-140, 70], [-120, 50], [-80, 25], [-60, 45], [-70, 60], [-100, 70], [-170, 70]],
    // South America  
    [[-80, 12], [-70, -55], [-40, -55], [-35, 5], [-60, 12], [-80, 12]],
    // Europe
    [[-10, 35], [40, 35], [40, 70], [-10, 70], [-10, 35]],
    // Africa
    [[-20, 35], [50, 35], [40, -35], [20, -35], [-20, 35]],
    // Asia
    [[40, 35], [180, 35], [180, 70], [40, 70], [40, 35]],
    // Australia
    [[110, -10], [155, -10], [155, -45], [110, -45], [110, -10]],
    // Antarctica
    [[-180, -60], [180, -60], [180, -85], [-180, -85], [-180, -60]]
];

/**
 * p5.js setup function - runs once when the program starts
 */
function setup() {
    // Get canvas container
    const canvasContainer = document.getElementById('map-canvas');
    const containerRect = canvasContainer.getBoundingClientRect();
    
    // Set canvas dimensions
    app.mapWidth = containerRect.width;
    app.mapHeight = containerRect.height;
    
    // Create canvas and attach to container
    app.canvas = createCanvas(app.mapWidth, app.mapHeight);
    app.canvas.parent('map-canvas');
    
    // Initialize core components
    initializeComponents();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize performance monitoring
    app.performance.lastTime = performance.now();
    
    // Hide loading screen
    hideLoadingScreen();
    
    console.log('ISS Tracker initialized successfully');
    console.log(`Canvas dimensions: ${app.mapWidth}x${app.mapHeight}`);
}

/**
 * p5.js draw function - runs continuously (60 FPS target)
 */
function draw() {
    // Update performance monitoring
    updatePerformanceMetrics();
    
    // Clear canvas with space background
    background(10, 10, 42); // Deep space color
    
    // Draw map layers
    drawWorldMap();
    drawGridLines();
    drawISS();
    drawOrbitalPath();
    
    // Update UI elements
    if (app.ui) {
        app.ui.updateDisplays();
    }
    
    // Show demo mode notification if needed
    if (app.issPosition && app.issPosition.demo && !app.demoNotificationShown) {
        showDemoNotification();
        app.demoNotificationShown = true;
    }
}

/**
 * Initialize all application components
 */
function initializeComponents() {
    try {
        // Initialize Mercator projection
        app.projection = new MercatorProjection(app.mapWidth, app.mapHeight);
        console.log('Mercator projection initialized');
        
        // Initialize API client with reliable CORS-friendly endpoints
        app.apiClient = new APIClient({
            primary: {
                url: 'https://api.wheretheiss.at/v1/satellites/25544',
                timeout: 3000,
                retries: 3,
                rateLimit: 1000
            },
            backup: {
                url: 'https://api.wheretheiss.at/v1/satellites/25544',
                timeout: 5000,
                retries: 2,
                rateLimit: 1500
            }
        });
        console.log('API client initialized');
        
        // Initialize audio manager
        app.audioManager = new AudioManager();
        console.log('Audio manager initialized');
        
        // Initialize ISS tracker
        app.tracker = new ISSTracker(app.apiClient, app.audioManager);
        console.log('ISS tracker initialized');
        
        // Initialize UI controller
        app.ui = new UIController(app);
        console.log('UI controller initialized');
        
    } catch (error) {
        console.error('Error initializing components:', error);
        showError('Initialization Error', 'Failed to initialize application components');
    }
}

/**
 * Set up event listeners for responsive design and user interactions
 */
function setupEventListeners() {
    // Window resize handler
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Canvas click handler for ISS centering
    if (app.canvas) {
        app.canvas.mousePressed(() => {
            if (app.isTracking && app.issPosition) {
                centerOnISS();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    // Visibility change handler (pause tracking when tab not visible)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Error modal handlers
    document.getElementById('retry-btn')?.addEventListener('click', retryConnection);
    document.getElementById('dismiss-error')?.addEventListener('click', dismissError);
    
    // Info modal handlers
    document.getElementById('info-btn')?.addEventListener('click', showInfoModal);
    
    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                hideModal(modal);
            }
        });
    });
    
    // Fullscreen handler
    document.getElementById('fullscreen-btn')?.addEventListener('click', toggleFullscreen);
}

/**
 * Handle window resize - update canvas dimensions
 */
function handleResize() {
    const canvasContainer = document.getElementById('map-canvas');
    const containerRect = canvasContainer.getBoundingClientRect();
    
    app.mapWidth = containerRect.width;
    app.mapHeight = containerRect.height;
    
    // Resize canvas
    resizeCanvas(app.mapWidth, app.mapHeight);
    
    // Update projection with new dimensions
    if (app.projection) {
        app.projection.updateDimensions(app.mapWidth, app.mapHeight);
    }
    
    console.log(`Canvas resized to: ${app.mapWidth}x${app.mapHeight}`);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyPress(event) {
    // Prevent default behavior for our shortcuts
    const shortcuts = ['Space', 'KeyF', 'KeyI', 'KeyG', 'KeyP', 'KeyM'];
    if (shortcuts.includes(event.code)) {
        event.preventDefault();
    }
    
    switch (event.code) {
        case 'Space':
            app.ui?.toggleTracking();
            break;
        case 'KeyF':
            toggleFullscreen();
            break;
        case 'KeyI':
            showInfoModal();
            break;
        case 'KeyG':
            app.config.showGrid = !app.config.showGrid;
            document.getElementById('show-grid').checked = app.config.showGrid;
            break;
        case 'KeyP':
            app.config.showPath = !app.config.showPath;
            document.getElementById('show-orbit-path').checked = app.config.showPath;
            break;
        case 'KeyM':
            app.audioManager?.toggleMute();
            break;
        case 'Escape':
            hideAllModals();
            break;
    }
}

/**
 * Handle visibility change (pause/resume tracking)
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden, pause tracking to save resources
        if (app.tracker && app.isTracking) {
            app.tracker.pauseTracking();
            console.log('Tracking paused - page hidden');
        }
    } else {
        // Page is visible, resume tracking
        if (app.tracker && app.isTracking) {
            app.tracker.resumeTracking();
            console.log('Tracking resumed - page visible');
        }
    }
}

/**
 * Draw the world map outline
 */
function drawWorldMap() {
    stroke(50, 76, 117); // Cosmic blue
    strokeWeight(1.5);
    fill(26, 26, 46, 100); // Semi-transparent deep space
    
    for (const continent of worldMapOutline) {
        beginShape();
        for (const [lng, lat] of continent) {
            const projected = app.projection.project(lat, lng);
            vertex(projected.x, projected.y);
        }
        endShape(CLOSE);
    }
}

/**
 * Draw Mercator grid lines
 */
function drawGridLines() {
    if (!app.config.showGrid) return;
    
    stroke(50, 76, 117, 150); // Semi-transparent cosmic blue
    strokeWeight(0.5);
    
    // Draw meridians (longitude lines)
    for (let lng = -180; lng <= 180; lng += 10) {
        const top = app.projection.project(85, lng);
        const bottom = app.projection.project(-85, lng);
        line(top.x, top.y, bottom.x, bottom.y);
    }
    
    // Draw parallels (latitude lines)
    for (let lat = -80; lat <= 80; lat += 10) {
        const left = app.projection.project(lat, -180);
        const right = app.projection.project(lat, 180);
        line(left.x, left.y, right.x, right.y);
    }
    
    // Draw equator and prime meridian more prominently
    stroke(65, 184, 213, 200); // Orbit cyan
    strokeWeight(1);
    
    // Equator
    const equatorLeft = app.projection.project(0, -180);
    const equatorRight = app.projection.project(0, 180);
    line(equatorLeft.x, equatorLeft.y, equatorRight.x, equatorRight.y);
    
    // Prime meridian
    const primeTop = app.projection.project(85, 0);
    const primeBottom = app.projection.project(-85, 0);
    line(primeTop.x, primeTop.y, primeBottom.x, primeBottom.y);
}

/**
 * Draw the ISS position
 */
function drawISS() {
    if (!app.issPosition) return;
    
    const projected = app.projection.project(app.issPosition.lat, app.issPosition.lng);
    
    // Draw ISS glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = '#FFD700';
    
    // Draw ISS icon
    fill(255, 215, 0); // Gold color
    noStroke();
    
    // Simple ISS representation (cross shape)
    const size = 12;
    
    // Main body
    rect(projected.x - size/2, projected.y - 2, size, 4);
    
    // Solar panels
    rect(projected.x - size*1.5, projected.y - 1, size*3, 2);
    
    // Clear shadow
    drawingContext.shadowBlur = 0;
    
    // Draw direction indicator
    if (app.previousPosition) {
        const prevProjected = app.projection.project(app.previousPosition.lat, app.previousPosition.lng);
        const angle = atan2(projected.y - prevProjected.y, projected.x - prevProjected.x);
        
        stroke(255, 215, 0);
        strokeWeight(2);
        const arrowLength = 20;
        line(projected.x, projected.y, 
             projected.x + cos(angle) * arrowLength, 
             projected.y + sin(angle) * arrowLength);
        
        // Arrow head
        const headSize = 8;
        push();
        translate(projected.x + cos(angle) * arrowLength, projected.y + sin(angle) * arrowLength);
        rotate(angle);
        line(0, 0, -headSize, -headSize/2);
        line(0, 0, -headSize, headSize/2);
        pop();
    }
}

/**
 * Draw the orbital path
 */
function drawOrbitalPath() {
    if (!app.config.showPath || app.orbitalPath.length < 2) return;
    
    stroke(65, 184, 213, 150); // Semi-transparent orbit cyan
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (const position of app.orbitalPath) {
        const projected = app.projection.project(position.lat, position.lng);
        vertex(projected.x, projected.y);
    }
    endShape();
    
    // Draw path points
    fill(65, 184, 213, 100);
    noStroke();
    for (let i = 0; i < app.orbitalPath.length; i++) {
        const position = app.orbitalPath[i];
        const projected = app.projection.project(position.lat, position.lng);
        const alpha = map(i, 0, app.orbitalPath.length - 1, 50, 255);
        fill(65, 184, 213, alpha);
        circle(projected.x, projected.y, 4);
    }
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics() {
    const currentTime = performance.now();
    app.performance.frameCount++;
    
    // Calculate FPS every second
    if (currentTime - app.performance.lastTime >= 1000) {
        app.performance.fps = Math.round(app.performance.frameCount * 1000 / (currentTime - app.performance.lastTime));
        app.performance.frameCount = 0;
        app.performance.lastTime = currentTime;
        
        // Update memory usage if available
        if (performance.memory) {
            app.performance.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
    }
}

/**
 * Center the map view on the ISS position
 */
function centerOnISS() {
    // This would require implementing pan/zoom functionality
    // For now, just log the action
    console.log('Centering on ISS position:', app.issPosition);
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * Show error modal
 */
function showError(title, message, suggestions = []) {
    const modal = document.getElementById('error-modal');
    const titleElement = document.getElementById('error-title');
    const messageElement = document.getElementById('error-message');
    
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    
    showModal(modal);
    
    app.errors.count++;
    app.errors.lastError = { title, message, time: Date.now() };
}

/**
 * Show info modal
 */
function showInfoModal() {
    const modal = document.getElementById('info-modal');
    showModal(modal);
}

/**
 * Show modal
 */
function showModal(modal) {
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus first focusable element
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
    }
}

/**
 * Hide modal
 */
function hideModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Hide all modals
 */
function hideAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        hideModal(modal);
    });
}

/**
 * Retry connection
 */
function retryConnection() {
    hideAllModals();
    if (app.tracker) {
        app.tracker.retryConnection();
    }
}

/**
 * Dismiss error
 */
function dismissError() {
    hideAllModals();
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500); // Small delay for smooth transition
    }
}

/**
 * Show demo mode notification
 */
function showDemoNotification() {
    const notification = document.createElement('div');
    notification.className = 'demo-notification';
    notification.innerHTML = `
        <div style="background: linear-gradient(135deg, #ff6b35, #ffa500); color: white; padding: 1rem; border-radius: 8px; margin: 1rem; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
            <h3 style="margin: 0 0 0.5rem 0;">🚀 Demo Mode Active</h3>
            <p style="margin: 0; font-size: 0.9rem;">
                Real ISS APIs are not accessible due to CORS restrictions. 
                <br>Showing simulated ISS orbit for demonstration purposes.
            </p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem 1rem; border-radius: 4px; margin-top: 0.5rem; cursor: pointer;">
                Got it!
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
        max-width: 350px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 10000);
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export app object for debugging in console
window.issTrackerApp = app;