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
 * @property {boolean} tap - Enable tap interactions on mobile devices
 * @property {number} tapTolerance - Increased tap area for better mobile UX
 * @property {number} zoomDelta - Smaller zoom increments (0.25) for smoother control
 * @property {number} zoomSnap - Allow fractional zoom levels
 */
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false, // Disable mouse wheel zoom
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

        // Destructure latitude and longitude from the API response data.
        const { latitude, longitude } = data;

        // Validate coordinates
        if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
            isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Invalid coordinates received from API');
        }

        // Update the marker's position on the map.
        const newLatLng = L.latLng(latitude, longitude);
        issMarker.setLatLng(newLatLng);

        // Center map on ISS location with full world view
        if (isFirstLoad) {
            // Initial load: Set view at zoom level 2 to show full world view
            map.setView(newLatLng, 2, { animate: false });
            console.log('ISS position loaded:', latitude.toFixed(4), longitude.toFixed(4), 'Zoom level: 2 (full world view)');
            isFirstLoad = false;
        } else {
            // Keep ISS centered as it moves, maintaining full world view
            map.panTo(newLatLng, { animate: true, duration: 1 });
        }

        // Update the content of the 'iss-info' div with the new coordinates.
        // We use .toFixed(4) to show the coordinates with 4 decimal places for more precision.
        issInfo.innerHTML = `Latitude: ${latitude.toFixed(4)} &nbsp;|&nbsp; Longitude: ${longitude.toFixed(4)}`;
        issInfo.setAttribute('aria-label', `ISS location: Latitude ${latitude.toFixed(4)}, Longitude ${longitude.toFixed(4)}`);

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
    
    // And then set it to run every 5 seconds (5000 milliseconds) to get real-time updates.
    window.updateInterval = setInterval(updateIssPosition, 5000);
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
