// The URL for the ISS position API.
const issApiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';

// Get a reference to the HTML element where we'll display the coordinates.
const issInfo = document.getElementById('iss-info');

// Initialize the map and set its view to France's coordinates.
// The first parameter is an array with latitude and longitude.
// The second parameter is the zoom level. A higher number means more zoomed in.
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    tap: true, // Enable tap interaction on mobile
    tapTolerance: 15, // Increase tap tolerance for better mobile UX
    zoomDelta: 0.25, // Smaller zoom steps for smoother zooming
    zoomSnap: 0.25 // Allow fractional zoom levels
}).setView([46.2, 2.2], 3);

// Expose map instance globally for resize handler
window.mapInstance = map;

// Add a tile layer to the map. This is the background map image.
// We're using OpenStreetMap, a free and open map provider.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // This attribution is important for giving credit to OpenStreetMap.
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 2
}).addTo(map);

// Create a custom icon for the ISS marker.
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 50], // size of the icon in pixels
    iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
});

// Create a marker for the ISS and add it to the map.
// We give it a starting position, but our script will update it quickly.
const issMarker = L.marker([0, 0], {
    icon: issIcon,
    title: 'International Space Station'
}).addTo(map);

// Track fetch errors to prevent spam
let consecutiveErrors = 0;
const MAX_ERRORS = 3;
let isFirstLoad = true;

/**
 * Fetches the ISS data and updates the map and info display.
 * Shows a loading state and user-friendly error message if needed.
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

        // Update the marker's position on the map.
        const newLatLng = L.latLng(latitude, longitude);
        issMarker.setLatLng(newLatLng);

        // Always center the map on the ISS
        if (isFirstLoad) {
            map.setView(newLatLng, 3, { animate: false });
            isFirstLoad = false;
        } else {
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
            clearInterval(updateInterval);
        }
    }
}

// Call the function once to get the position immediately when the page loads.
updateIssPosition();

// And then set it to run every 5 seconds (5000 milliseconds) to get real-time updates.
const updateInterval = setInterval(updateIssPosition, 5000);