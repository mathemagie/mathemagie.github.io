/**
 * @fileoverview ISS Position Tracker - Real-time International Space Station tracking
 * @description Fetches ISS position data from Where The ISS At API and displays it
 *              on an interactive Leaflet map. Updates every 5 seconds with smooth
 *              animations and error handling.
 * @author Mathemagie
 * @version 1.0.0
 */

/**
 * API endpoint URL for fetching International Space Station position data.
 * NORAD ID 25544 corresponds to the ISS.
 * @type {string}
 * @constant
 * @see {@link https://wheretheiss.at/ Where The ISS At API}
 */
const issApiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';

/**
 * HTML element reference for displaying ISS coordinates.
 * @type {HTMLElement}
 */
const issInfo = document.getElementById('iss-info');

/**
 * Leaflet map instance initialized with world view.
 * Configured for optimal user experience with touch support and smooth zooming.
 * @type {L.Map}
 * @property {boolean} zoomControl - Enable zoom controls (+/- buttons)
 * @property {boolean} attributionControl - Show map attribution
 * @property {boolean} scrollWheelZoom - Disabled to prevent accidental zooming
 * @property {boolean} touchZoom - Disabled to prevent pinch-to-zoom on mobile
 * @property {boolean} doubleClickZoom - Disabled to prevent double-click zoom
 * @property {boolean} boxZoom - Disabled to prevent box zoom (shift+drag)
 * @property {boolean} tap - Enable tap interactions on mobile devices
 * @property {number} tapTolerance - Increased tap area for better mobile UX
 * @property {number} zoomDelta - Smaller zoom increments (0.25) for smoother control
 * @property {number} zoomSnap - Allow fractional zoom levels
 */
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false, // Disable mouse wheel zoom
    touchZoom: false, // Disable pinch-to-zoom on mobile devices
    doubleClickZoom: false, // Disable double-click zoom
    boxZoom: false, // Disable box zoom (shift+drag)
    tap: true, // Enable tap interaction on mobile
    tapTolerance: 15, // Increase tap tolerance for better mobile UX
    zoomDelta: 0.25, // Smaller zoom steps for smoother zooming
    zoomSnap: 0.25 // Allow fractional zoom levels
}).setView([0, 0], 2); // Start with full world view, will update to ISS location

/**
 * Expose map instance globally for resize handler in index.html
 * @type {L.Map}
 * @global
 */
window.mapInstance = map;

/**
 * OpenStreetMap tile layer configuration.
 * Provides the background map imagery using free, open-source map tiles.
 * @type {L.TileLayer}
 * @property {string} attribution - Required attribution for OpenStreetMap
 * @property {number} maxZoom - Maximum zoom level (20 = street level detail)
 * @property {number} minZoom - Minimum zoom level (2 = world view)
 * @see {@link https://www.openstreetmap.org/ OpenStreetMap}
 */
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // This attribution is important for giving credit to OpenStreetMap.
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20, // Maximum zoom level for detailed street-level view
    minZoom: 2
}).addTo(map);

/**
 * Day/night terminator overlay showing sunlight and shadow areas on Earth.
 * @type {L.Terminator}
 */
let terminator = L.terminator({
    fillColor: '#000000',
    fillOpacity: 0.3,
    weight: 2,
    color: '#ffffff',
    opacity: 0.5
}).addTo(map);

// Update terminator every minute to reflect Earth's rotation
setInterval(() => {
    terminator.setTime();
}, 60000); // 60 seconds

/**
 * Add fullscreen control to the map.
 * Allows users to view the map in fullscreen mode for better visibility.
 */
map.addControl(new L.Control.Fullscreen({
    position: 'topleft',
    title: 'Toggle fullscreen',
    titleCancel: 'Exit fullscreen'
}));

/**
 * Add scale bar to the map showing metric units (kilometers).
 * Provides visual reference for distances on the map.
 */
L.control.scale({
    position: 'bottomleft',
    imperial: false, // Only show metric (km)
    maxWidth: 150
}).addTo(map);

/**
 * Custom control to center the map on the ISS location.
 * Provides quick navigation back to the ISS if user pans away.
 */
L.Control.ZoomToISS = L.Control.extend({
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.innerHTML = '<a href="#" title="Center on ISS" role="button" aria-label="Center map on ISS"><i class="fas fa-satellite"></i></a>';
        container.style.backgroundColor = 'rgba(26, 31, 58, 0.95)';
        container.style.width = '30px';
        container.style.height = '30px';

        container.onclick = function(e) {
            e.preventDefault();
            if (issMarker) {
                map.setView(issMarker.getLatLng(), 3, { animate: true, duration: 1 });
            }
        };

        return container;
    }
});

L.control.zoomToISS = function(opts) {
    return new L.Control.ZoomToISS(opts);
};

L.control.zoomToISS({ position: 'topleft' }).addTo(map);

/**
 * Custom icon configuration for the ISS marker.
 * Uses SVG icon from Wikipedia Commons showing the International Space Station.
 * @type {L.Icon}
 * @property {string} iconUrl - URL to the ISS SVG icon
 * @property {number[]} iconSize - Icon dimensions in pixels [width, height]
 * @property {number[]} iconAnchor - Anchor point for marker positioning
 * @see {@link https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg ISS Icon}
 */
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 50], // size of the icon in pixels
    iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
});

/**
 * Leaflet marker instance representing the International Space Station.
 * Initially positioned at [0, 0] but updated immediately when ISS data loads.
 * @type {L.Marker}
 * @property {L.Icon} icon - Custom ISS icon
 * @property {string} title - Tooltip text on hover
 * @property {boolean} riseOnHover - Marker elevates when hovered for better visibility
 */
const issMarker = L.marker([0, 0], {
    icon: issIcon,
    title: 'International Space Station',
    riseOnHover: true // Marker rises when hovered for better visibility
}).addTo(map);

/**
 * Leaflet circle instance representing ISS visibility footprint.
 * @type {L.Circle}
 */
let footprintCircle = null;

/**
 * Counter for tracking consecutive API fetch errors.
 * Used to prevent infinite retry loops and stop updates after repeated failures.
 * @type {number}
 */
let consecutiveErrors = 0;

/**
 * Maximum number of consecutive errors before stopping position updates.
 * Prevents unnecessary API requests when the service is unavailable.
 * @type {number}
 * @constant
 */
const MAX_ERRORS = 3;

/**
 * Flag indicating if this is the first ISS position load.
 * Used to determine whether to set initial view or pan smoothly.
 * @type {boolean}
 */
let isFirstLoad = true;

/**
 * Updates the ISS footprint circle on the map.
 * The footprint represents the area from which the ISS is visible above the horizon.
 *
 * @param {number} latitude - ISS latitude
 * @param {number} longitude - ISS longitude
 * @param {number} footprintKm - Footprint diameter in kilometers
 */
function updateFootprintCircle(latitude, longitude, footprintKm) {
    const footprintRadiusMeters = (footprintKm / 2) * 1000; // Convert km diameter to meters radius

    if (!footprintCircle) {
        // Create circle on first load
        footprintCircle = L.circle([latitude, longitude], {
            radius: footprintRadiusMeters,
            color: '#00d4ff',
            fillColor: '#00d4ff',
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.4
        }).addTo(map);
    } else {
        // Update existing circle
        footprintCircle.setLatLng([latitude, longitude]);
        footprintCircle.setRadius(footprintRadiusMeters);
    }
}

/**
 * Updates the metadata display with ISS telemetry data.
 *
 * @param {Object} data - ISS data from the API
 * @param {number} data.latitude - Latitude coordinate
 * @param {number} data.longitude - Longitude coordinate
 * @param {number} data.altitude - Altitude in km
 * @param {number} data.velocity - Velocity in km/h
 * @param {string} data.visibility - Visibility status (daylight or eclipsed)
 * @param {number} data.footprint - Footprint diameter in km
 */
function updateMetadataDisplay(data) {
    const { latitude, longitude, altitude, velocity, visibility, footprint } = data;

    issInfo.innerHTML = `
        <div class="iss-info__primary">
            <span class="iss-info__coord">Lat: ${latitude.toFixed(4)}°</span>
            <span class="iss-info__separator">|</span>
            <span class="iss-info__coord">Lon: ${longitude.toFixed(4)}°</span>
        </div>
        <div class="iss-info__metadata">
            <span class="iss-info__meta-item">
                <i class="fas fa-arrows-alt-v" aria-hidden="true"></i>
                ${altitude.toFixed(2)} km
            </span>
            <span class="iss-info__meta-item">
                <i class="fas fa-rocket" aria-hidden="true"></i>
                ${velocity.toFixed(0)} km/h
            </span>
            <span class="iss-info__meta-item">
                <i class="fas fa-${visibility === 'daylight' ? 'sun' : 'moon'}" aria-hidden="true"></i>
                ${visibility}
            </span>
            <span class="iss-info__meta-item" title="Visibility footprint diameter">
                <i class="fas fa-circle" aria-hidden="true"></i>
                ${footprint.toFixed(0)} km
            </span>
        </div>
    `;
    issInfo.setAttribute('aria-label', `ISS location: Latitude ${latitude.toFixed(4)}, Longitude ${longitude.toFixed(4)}, Altitude ${altitude.toFixed(2)} km, Velocity ${velocity.toFixed(0)} km/h`);
}

/**
 * Fetches the current ISS position from the API and updates the map marker and info display.
 * 
 * This function:
 * - Makes an async request to the Where The ISS At API
 * - Validates the received coordinates
 * - Updates the ISS marker position on the map
 * - Centers the map on the ISS (world view on first load, smooth pan on updates)
 * - Updates the coordinate display with 4 decimal precision
 * - Handles errors gracefully with user-friendly messages
 * 
 * @async
 * @function updateIssPosition
 * @returns {Promise<void>}
 * @throws {Error} If API request fails or returns invalid data
 * 
 * @example
 * // Called automatically every 5 seconds
 * await updateIssPosition();
 */
async function updateIssPosition() {
    try {
        // 'await' pauses the function until the data is fetched from the API.
        const response = await fetch(issApiUrl);
        if (!response.ok) throw new Error('Network response was not ok');

        // 'await' pauses the function until the response is converted to JSON.
        const data = await response.json();

        // Destructure latitude, longitude, and metadata from the API response data.
        const { latitude, longitude, altitude, velocity, visibility, footprint } = data;

        // Store current ISS data globally for France pass detection
        window.currentIssData = data;

        // Validate coordinates
        if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
            isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Invalid coordinates received from API');
        }

        // Update the marker's position on the map.
        const newLatLng = L.latLng(latitude, longitude);
        issMarker.setLatLng(newLatLng);

        // Update the footprint circle
        updateFootprintCircle(latitude, longitude, footprint);

        // Center map on ISS location with full world view
        if (isFirstLoad) {
            // Initial load: Set view at zoom level 2 to show full world view
            map.setView(newLatLng, 2, { animate: false });
            console.log('ISS position loaded:', latitude.toFixed(4), longitude.toFixed(4), 'Zoom level: 2 (full world view)');
            // Remove loading skeleton after first successful load
            issInfo.classList.remove('iss-info--loading');
            isFirstLoad = false;
        } else {
            // Keep ISS centered as it moves, maintaining full world view
            map.panTo(newLatLng, { animate: true, duration: 1 });
        }

        // Update the metadata display with coordinates and telemetry data
        updateMetadataDisplay(data);

        // Update France pass prediction display
        updateFrancePassDisplay();

        // Reset error counter on success
        consecutiveErrors = 0;

    } catch (error) {
        consecutiveErrors++;

        // If something goes wrong with fetching the data, we log an error to the console.
        console.error("Error fetching ISS position:", error);

        // Display an error message if the API call fails.
        issInfo.innerHTML = 'Could not retrieve ISS position. Please try again later.';

        // Stop fetching after too many consecutive errors to prevent unnecessary requests
        if (consecutiveErrors >= MAX_ERRORS) {
            console.warn('Too many consecutive errors. Stopping ISS position updates.');
            if (window.updateInterval) {
                clearInterval(window.updateInterval);
            }
        }
    }
}

/**
 * Initializes the ISS tracking system.
 * 
 * This function:
 * - Fetches the initial ISS position immediately
 * - Sets up an interval to update the position every 5 seconds
 * - Stores the interval ID globally for cleanup if needed
 * 
 * @function initializeIssTracking
 * @returns {void}
 * 
 * @example
 * // Called automatically when map is ready
 * initializeIssTracking();
 */
function initializeIssTracking() {
    // Call the function once to get the position immediately when the page loads.
    updateIssPosition();

    // And then set it to run every 10 seconds (10000 milliseconds) to get real-time updates.
    // Optimized from 5s to reduce API calls while maintaining smooth tracking.
    window.updateInterval = setInterval(updateIssPosition, 10000);
}

// ========================================
// FRANCE PASS PREDICTION MODULE
// ========================================

/**
 * France geographic boundaries (from Python code).
 * @type {Object}
 */
const FRANCE_BOUNDS = {
    minLat: 41.3,
    maxLat: 51.1,
    minLon: -5.1,
    maxLon: 8.2
};

let tleData = null;
let nextPass = null;
let currentPass = null;
let passHistory = [];

/**
 * Fetches TLE (Two-Line Element) data for orbital calculations.
 * @async
 * @returns {Promise<Object|null>} TLE data or null on error
 */
async function fetchTLEData() {
    try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544/tles?format=json');
        if (!response.ok) throw new Error('Failed to fetch TLE data');
        const data = await response.json();
        tleData = data[0];
        tleData.fetchedAt = Date.now();
        console.log('TLE data loaded:', tleData.date);
        return tleData;
    } catch (error) {
        console.error('Error fetching TLE data:', error);
        return null;
    }
}

/**
 * Checks if coordinates are within France boundaries.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if over France
 */
function isOverFrance(lat, lon) {
    return lat >= FRANCE_BOUNDS.minLat &&
           lat <= FRANCE_BOUNDS.maxLat &&
           lon >= FRANCE_BOUNDS.minLon &&
           lon <= FRANCE_BOUNDS.maxLon;
}

/**
 * Calculates the next ISS pass over France using TLE data.
 * @returns {Object|null} Pass data with start/end times and duration
 */
function calculateNextPass() {
    if (!tleData || !window.satellite) return null;

    const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);
    const now = new Date();
    let checkTime = new Date(now);

    const maxLookAhead = 24 * 60 * 60 * 1000; // 24 hours
    const checkInterval = 30 * 1000; // 30 seconds
    const MIN_PASS_DURATION = 10; // seconds

    let passStart = null;
    let inPass = false;

    for (let elapsed = 0; elapsed < maxLookAhead; elapsed += checkInterval) {
        checkTime = new Date(now.getTime() + elapsed);
        const positionAndVelocity = satellite.propagate(satrec, checkTime);

        if (positionAndVelocity.position && typeof positionAndVelocity.position === 'object') {
            const gmst = satellite.gstime(checkTime);
            const geodeticCoords = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

            const lat = satellite.degreesLat(geodeticCoords.latitude);
            const lon = satellite.degreesLong(geodeticCoords.longitude);

            const overFrance = isOverFrance(lat, lon);

            if (overFrance && !inPass) {
                passStart = checkTime;
                inPass = true;
            } else if (!overFrance && inPass) {
                const duration = (checkTime - passStart) / 1000;
                if (duration >= MIN_PASS_DURATION) {
                    return {
                        startTime: passStart,
                        endTime: checkTime,
                        duration: duration
                    };
                }
                inPass = false;
                passStart = null;
            }
        }
    }

    return null;
}

/**
 * Updates the France pass display with current status and predictions.
 */
function updateFrancePassDisplay() {
    const francePassInfo = document.getElementById('france-pass-info');
    if (!francePassInfo) return;

    const currentData = window.currentIssData;
    if (!currentData) return;

    const currentlyOverFrance = isOverFrance(currentData.latitude, currentData.longitude);

    // Detect pass start/end
    if (currentlyOverFrance && !currentPass) {
        currentPass = { startTime: new Date() };
        francePassInfo.classList.add('france-pass-info--active');
    } else if (!currentlyOverFrance && currentPass) {
        currentPass.endTime = new Date();
        currentPass.duration = (currentPass.endTime - currentPass.startTime) / 1000;
        passHistory.unshift(currentPass);
        if (passHistory.length > 5) passHistory.pop();
        currentPass = null;
        francePassInfo.classList.remove('france-pass-info--active');
        nextPass = calculateNextPass();
    }

    // Build display HTML
    let html = '';

    if (currentlyOverFrance) {
        html = `
            <div class="france-pass-info__current">
                <i class="fas fa-satellite-dish"></i>
                <strong>ISS is over France NOW!</strong>
            </div>
        `;
    } else if (nextPass) {
        const timeUntil = nextPass.startTime - new Date();
        const hours = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

        html = `
            <div class="france-pass-info__next">
                <div class="france-pass-info__label">Next pass over France:</div>
                <div class="france-pass-info__countdown">
                    ${hours}h ${minutes}m
                </div>
                <div class="france-pass-info__details">
                    ${nextPass.startTime.toLocaleTimeString()} - ${nextPass.endTime.toLocaleTimeString()}
                    (${Math.round(nextPass.duration)}s duration)
                </div>
            </div>
        `;
    } else {
        html = `<div class="france-pass-info__none">No pass over France in next 24 hours</div>`;
    }

    // Add history
    if (passHistory.length > 0) {
        html += `
            <details class="france-pass-info__history">
                <summary>Recent passes (${passHistory.length})</summary>
                <ul>
                    ${passHistory.map(pass => `
                        <li>
                            ${pass.startTime.toLocaleString()} -
                            ${Math.round(pass.duration)}s duration
                        </li>
                    `).join('')}
                </ul>
            </details>
        `;
    }

    francePassInfo.innerHTML = html;
}

/**
 * Initializes the France pass prediction system.
 * @async
 */
async function initializeFrancePassPrediction() {
    await fetchTLEData();
    if (tleData) {
        nextPass = calculateNextPass();
        updateFrancePassDisplay();

        // Update every minute
        setInterval(() => {
            nextPass = calculateNextPass();
            updateFrancePassDisplay();
        }, 60000);

        // Refresh TLE data every 6 hours
        setInterval(fetchTLEData, 6 * 60 * 60 * 1000);
    }
}

/**
 * Initialization sequence with multiple fallback methods.
 * 
 * Strategy:
 * 1. Wait for DOM to be ready (if still loading)
 * 2. Wait for map tiles to load (map.whenReady)
 * 3. Fallback timeout ensures initialization even if events don't fire
 * 
 * This multi-layered approach ensures the tracking starts reliably
 * regardless of page load timing or browser differences.
 */
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded event
    document.addEventListener('DOMContentLoaded', function() {
        map.whenReady(initializeIssTracking);
    });
} else {
    // DOM already loaded, proceed directly
    map.whenReady(initializeIssTracking);
}

/**
 * Fallback initialization after 1 second delay.
 *
 * This ensures ISS tracking starts even if:
 * - map.whenReady() doesn't fire
 * - DOMContentLoaded event is missed
 * - There are timing issues with map tile loading
 *
 * Only runs if isFirstLoad is still true (tracking hasn't started yet).
 */
setTimeout(function() {
    if (isFirstLoad) {
        console.log('Fallback: Initializing ISS tracking');
        initializeIssTracking();
    }
}, 1000);

// Initialize France pass prediction system
initializeFrancePassPrediction();
