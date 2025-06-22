        // The URL for the ISS position API.
     const issApiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';

     // Get a reference to the HTML element where we'll display the coordinates.
     const issInfo = document.getElementById('iss-info');

     // Initialize the map and set its view to France's coordinates.
     // The first parameter is an array with latitude and longitude.
     // The second parameter is the zoom level. A higher number means more zoomed in.
     const map = L.map('map').setView([46.2, 2.2], 5);

     // Add a tile layer to the map. This is the background map image.
     // We're using OpenStreetMap, a free and open map provider.
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         // This attribution is important for giving credit to OpenStreetMap.
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
      * Fetches the ISS data and updates the map and info display.
      * Shows a loading state and user-friendly error message if needed.
      */
     async function updateIssPosition() {
         // Show loading state while fetching
         issInfo.innerHTML = 'Loading ISS position...';
         try {
             // 'await' pauses the function until the data is fetched from the API.
             const response = await fetch(issApiUrl);
             if (!response.ok) throw new Error('Network response was not ok');
             // 'await' pauses the function until the response is converted to JSON.
             const data = await response.json();

             // Destructure latitude and longitude from the API response data.
             const { latitude, longitude } = data;

             // Update the marker's position on the map.
             issMarker.setLatLng([latitude, longitude]);

             // Update the content of the 'iss-info' div with the new coordinates.
             // We use .toFixed(4) to show the coordinates with 4 decimal places for more precision.
             issInfo.innerHTML = `Latitude: ${latitude.toFixed(4)} &nbsp;|&nbsp; Longitude: ${longitude.toFixed(4)}`;

         } catch (error) {
             // If something goes wrong with fetching the data, we log an error to the console.
             // This is helpful for debugging!
             console.error("Error fetching ISS position:", error);
             // Display an error message if the API call fails.
             issInfo.innerHTML = 'Could not retrieve ISS position. Please try again later.';
         }
     }

     // Call the function once to get the position immediately when the page loads.
     updateIssPosition();

     // And then set it to run every 5 seconds (5000 milliseconds) to get real-time updates.
     setInterval(updateIssPosition, 5000);