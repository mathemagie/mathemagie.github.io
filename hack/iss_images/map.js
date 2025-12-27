// Get references to the new radio player elements
const audioPlayer = document.getElementById('audio-player');
const stationNameDisplay = document.getElementById('station-name');
const radioStatusDisplay = document.getElementById('radio-status');

// A variable to keep track of the country from the previous update
let lastCountry = null;

// The URL for the ISS position API.
const issApiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';

// Get a reference to the HTML element where we'll display the coordinates.
const issInfo = document.getElementById('iss-info');

// Initialize the map and set its view to France's coordinates.
// The first parameter is an array with latitude and longitude.
// The second parameter is the zoom level. A higher number means more zoomed in.
const map = L.map('map').setView([46.2, 2.2], 3);

// Add a dark tile layer to the map that matches our dark theme.
// We're using CartoDB's dark matter tiles for a space-like appearance.
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    // This attribution is important for giving credit to the map providers.
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Create a custom icon for the ISS marker.
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 50], // size of the icon in pixels
    iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
});

// Create a marker for the ISS and add it to the map.
// We give it a starting position, but our script will update it quickly.
const issMarker = L.marker([0, 0], {icon: issIcon}).addTo(map);

/**
 * Gets the country name from latitude and longitude coordinates using a browser-friendly reverse geocoding API.
 * Returns the country name if found, or null if over ocean/international waters.
 */
async function getCountryFromCoordinates(latitude, longitude) {
    try {
        // Use the BigDataCloud API, which is designed for client-side use and doesn't have strict User-Agent policies.
        const geocodeUrl = `https://api-bdc.io/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        
        const response = await fetch(geocodeUrl);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Extract the country name from the BigDataCloud response.
        // If the ISS is over the ocean, this field will be empty.
        const country = data.countryName || null;
        
        // If we're over the ocean (no country), try to get the ocean name from localityInfo
        if (!country && data.localityInfo && data.localityInfo.informative) {
            const oceanInfo = data.localityInfo.informative.find(info => 
                info.description && info.description.includes('ocean')
            );
            if (oceanInfo) {
                return oceanInfo.name; // Return ocean name like "Indian Ocean"
            }
        }
        
        return country;
    } catch (error) {
        console.error("Geocoding failed:", error);
        return null; // Return null on any error.
    }
}

/**
 * Fetches a random, reliable radio station for a given country.
 * Returns an object with the station's name and stream URL, or null if none found.
 */
async function getRadioStationByCountry(country) {
    try {
        // Use a reliable server from the Radio Browser API network.
        // We search for stations by the exact country name.
        const radioApiUrl = `https://de1.api.radio-browser.info/json/stations/bycountryexact/${encodeURIComponent(country)}`;
        
        const response = await fetch(radioApiUrl);
        if (!response.ok) return null;
        
        const stations = await response.json();
        
        // Filter for reliable stations: good vote count, uses MP3 or AAC, and has a working URL.
        const goodStations = stations.filter(station => 
            station.votes > 2 && 
            (station.codec === 'MP3' || station.codec === 'AAC') && 
            station.url_resolved
        );
        
        if (goodStations.length > 0) {
            // Return a random station from our filtered list to provide variety.
            const station = goodStations[Math.floor(Math.random() * goodStations.length)];
            return {
                name: station.name,
                url: station.url_resolved
            };
        }
        return null; // No suitable station was found.
    } catch (error) {
        console.error("Error fetching radio stations:", error);
        return null;
    }
}

/**
 * Fetches the ISS data and updates the map and info display.
 * Shows a loading state and user-friendly error message if needed.
 * Now includes country and radio stream information!
 */
async function updateIssPosition() {
    try {
        const response = await fetch(issApiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const { latitude, longitude } = data;
        issMarker.setLatLng([latitude, longitude]);

        const currentCountry = await getCountryFromCoordinates(latitude, longitude);

        // Update the main info display
        const coordinates = `Latitude: ${latitude.toFixed(4)} &nbsp;|&nbsp; Longitude: ${longitude.toFixed(4)}`;
        const locationInfo = currentCountry 
            ? `<br><span style="color: #4CAF50; font-size: 16px;">🌍 Flying over: ${currentCountry}</span>`
            : `<br><span style="color: #2196F3; font-size: 16px;">🌊 Over international waters</span>`;
        issInfo.innerHTML = coordinates + locationInfo;

        // --- Radio Player Logic ---
        // Check if the ISS has moved to a new country since the last update.
        if (currentCountry !== lastCountry) {
            lastCountry = currentCountry; // Update the last known country.

            if (currentCountry) {
                // The ISS is over a new country, let's find a radio station.
                stationNameDisplay.textContent = `Searching for stations in ${currentCountry}...`;
                radioStatusDisplay.textContent = '(Searching)';
                
                const station = await getRadioStationByCountry(currentCountry);
                
                if (station) {
                    // We found a station! Update the player and play it.
                    stationNameDisplay.textContent = station.name;
                    audioPlayer.src = station.url;
                    audioPlayer.play();
                    radioStatusDisplay.textContent = '(Live)';
                } else {
                    // No station was found for this country.
                    stationNameDisplay.textContent = `No stations found for ${currentCountry}`;
                    audioPlayer.pause();
                    audioPlayer.src = '';
                    radioStatusDisplay.textContent = '(Paused)';
                }
            } else {
                // The ISS is over the ocean.
                stationNameDisplay.textContent = 'Over international waters';
                audioPlayer.pause();
                audioPlayer.src = '';
                radioStatusDisplay.textContent = '(Paused)';
            }
        }
    } catch (error) {
        console.error("Error fetching ISS position:", error);
        issInfo.innerHTML = 'Could not retrieve ISS position. Please try again later.';
    }
}

// Call the function once to get the position immediately when the page loads.
updateIssPosition();

// And then set it to run every 10 seconds (10000 milliseconds) to get real-time updates.
setInterval(updateIssPosition, 10000);
