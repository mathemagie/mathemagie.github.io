# Developer Guide

This guide provides detailed explanations of the codebase, making it easier to understand, modify, and extend the Nabaztag ISS Tracker project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [File-by-File Breakdown](#file-by-file-breakdown)
3. [Key Concepts Explained](#key-concepts-explained)
4. [Code Walkthrough](#code-walkthrough)
5. [Common Modifications](#common-modifications)
6. [Debugging Tips](#debugging-tips)

## Project Overview

This is a **static web application** - meaning it runs entirely in the browser without needing a server to process code. All files are plain text (HTML, CSS, JavaScript) that browsers can read directly.

### Why Static?

- **Simple**: No build tools, no compilation, no complex setup
- **Fast**: Files load directly from disk or web server
- **Portable**: Works anywhere HTML files work
- **Easy to Learn**: See exactly what's happening without abstraction layers

## File-by-File Breakdown

### `index.html` - The Structure

**What it does**: Defines the page structure and content.

**Key Sections**:

1. **`<head>` Section** (lines 3-37)
   - Meta tags for SEO and social sharing
   - Links to external resources (fonts, CSS libraries)
   - Preconnect hints for performance

2. **`<main>` Section** (lines 40-85)
   - Header with title and home link
   - Description paragraphs explaining the project
   - Video element for Nabaztag demonstration
   - ISS info display area
   - Map container div
   - Footer with links

3. **Scripts** (lines 86-136)
   - Leaflet library (map functionality)
   - `map.js` (our custom ISS tracking code)
   - Inline script for video interactions

**Learning Points**:
- HTML is like a blueprint - it defines what goes where
- Semantic tags (`<header>`, `<main>`, `<article>`) help screen readers
- `aria-label` attributes make the page accessible
- Scripts at the bottom load after content (better performance)

### `map.js` - The Logic

**What it does**: Fetches ISS position data and updates the map.

**Key Components**:

1. **Constants** (lines 1-2)
   ```javascript
   const issApiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';
   ```
   - Stores the API endpoint URL
   - `const` means it won't change (good practice)

2. **Map Initialization** (lines 10-17)
   ```javascript
   const map = L.map('map', {...}).setView([46.2, 2.2], 3);
   ```
   - Creates a Leaflet map instance
   - `'map'` refers to the HTML element with id="map"
   - `[46.2, 2.2]` is France's coordinates [latitude, longitude]
   - `3` is the zoom level (lower = more zoomed out)

3. **Tile Layer** (lines 24-29)
   ```javascript
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {...})
   ```
   - Adds the map background (the actual map image)
   - OpenStreetMap provides free map tiles
   - `{s}`, `{z}`, `{x}`, `{y}` are placeholders Leaflet fills in

4. **ISS Marker** (lines 32-43)
   ```javascript
   const issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);
   ```
   - Creates a marker (the ISS icon) on the map
   - Starts at [0, 0] but gets updated immediately
   - Custom icon from Wikipedia Commons

5. **Update Function** (lines 54-101)
   - `async function` means it can wait for data
   - `await fetch()` pauses until data arrives
   - Updates marker position and map center
   - Handles errors gracefully

6. **Update Interval** (line 107)
   ```javascript
   setInterval(updateIssPosition, 5000);
   ```
   - Runs `updateIssPosition` every 5000 milliseconds (5 seconds)
   - Keeps the ISS position current

**Learning Points**:
- `async/await` makes asynchronous code easier to read
- Error handling prevents crashes when API fails
- `setInterval` creates repeating actions
- Global variables (`window.mapInstance`) can be accessed elsewhere

### `styles.css` - The Appearance

**What it does**: Controls how everything looks.

**Key Sections**:

1. **CSS Variables** (lines 3-17)
   ```css
   :root {
       --primary-bg: #0a0e27;
       --accent: #00d4ff;
   }
   ```
   - Define colors once, use everywhere
   - Easy to change theme by updating variables
   - `:root` means "apply to entire document"

2. **Body Styling** (lines 19-31)
   - Sets background gradient (space theme)
   - Defines font family and colors
   - `min-height: 100vh` means "at least full viewport height"

3. **Starfield Effect** (lines 33-52)
   ```css
   body::before {
       background-image: radial-gradient(...);
   }
   ```
   - `::before` creates a pseudo-element (virtual element)
   - Multiple radial gradients create star-like dots
   - `pointer-events: none` means clicks pass through

4. **Animations** (lines 96-116)
   ```css
   @keyframes fadeInUp {
       from { opacity: 0; transform: translateY(30px); }
       to { opacity: 1; transform: translateY(0); }
   }
   ```
   - `@keyframes` defines animation steps
   - Elements fade in and slide up on page load
   - Creates smooth, professional feel

5. **Responsive Design** (lines 380-490)
   ```css
   @media screen and (max-width: 768px) {
       .site-title { font-size: 2rem; }
   }
   ```
   - `@media` queries apply styles conditionally
   - Different styles for different screen sizes
   - Mobile-first approach (smaller screens get smaller fonts)

**Learning Points**:
- CSS variables make themes easy
- Flexbox and Grid create layouts
- Animations add polish without JavaScript
- Media queries make sites responsive
- `:hover` states provide user feedback

## Key Concepts Explained

### Asynchronous JavaScript (async/await)

**What it is**: Code that doesn't block while waiting for data.

**Why it matters**: Fetching data from the internet takes time. Without async, the page would freeze.

**Example**:
```javascript
// Without async (BAD - blocks everything)
const data = fetch(url); // Page freezes here!

// With async (GOOD - page stays responsive)
const data = await fetch(url); // Page continues, then resumes here when data arrives
```

**In our code**:
```javascript
async function updateIssPosition() {
    const response = await fetch(issApiUrl); // Wait for API response
    const data = await response.json();      // Wait for JSON parsing
    // Now use the data...
}
```

### API (Application Programming Interface)

**What it is**: A way for programs to talk to each other.

**In this project**: Our JavaScript asks the ISS API "Where is the ISS?" and gets back coordinates.

**The Request**:
```
GET https://api.wheretheiss.at/v1/satellites/25544
```

**The Response**:
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "altitude": 408.5
}
```

**How we use it**:
```javascript
const response = await fetch(issApiUrl);
const data = await response.json();
const { latitude, longitude } = data; // Extract just what we need
```

### Error Handling

**What it is**: Code that runs when something goes wrong.

**Why it matters**: APIs can fail, networks can disconnect. Good error handling prevents crashes.

**Our approach**:
```javascript
try {
    // Try to fetch ISS data
    const response = await fetch(issApiUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    // Success! Update the map
} catch (error) {
    // Something went wrong - show error message instead of crashing
    console.error("Error:", error);
    issInfo.innerHTML = 'Could not retrieve ISS position.';
}
```

**Error tracking**:
```javascript
let consecutiveErrors = 0;
const MAX_ERRORS = 3;

// If we fail 3 times in a row, stop trying
if (consecutiveErrors >= MAX_ERRORS) {
    clearInterval(updateInterval); // Stop the update loop
}
```

### DOM Manipulation

**What it is**: Changing HTML elements with JavaScript.

**In our code**:
```javascript
// Get a reference to an element
const issInfo = document.getElementById('iss-info');

// Change its content
issInfo.innerHTML = `Latitude: ${latitude.toFixed(4)}`;

// Change its attributes
issInfo.setAttribute('aria-label', 'ISS location...');
```

**Why `.toFixed(4)`?**: Formats numbers to 4 decimal places (e.g., `48.8566` instead of `48.85660000000001`)

### Map Libraries (Leaflet)

**What it is**: A JavaScript library that makes maps easy.

**Why use a library?**: Maps are complex! Leaflet handles:
- Loading map tiles
- Converting coordinates to screen positions
- Zooming and panning
- Markers and icons

**Our usage**:
```javascript
// Create map
const map = L.map('map').setView([46.2, 2.2], 3);

// Add map tiles (the background)
L.tileLayer('...').addTo(map);

// Add marker
const marker = L.marker([lat, lng]).addTo(map);

// Update marker position
marker.setLatLng([newLat, newLng]);
```

## Code Walkthrough

### Step-by-Step: What Happens When Page Loads

1. **HTML loads** → Browser reads `index.html`
2. **CSS loads** → Styles applied, page looks pretty
3. **JavaScript starts** → `map.js` begins executing
4. **Map created** → Leaflet initializes map in `#map` div
5. **First update** → `updateIssPosition()` called immediately
6. **API request** → Fetch ISS position from API
7. **Data received** → Parse JSON response
8. **Map updated** → Marker moved to ISS location
9. **Interval starts** → `setInterval` begins 5-second updates
10. **Continuous updates** → ISS position refreshes every 5 seconds

### Understanding the Update Function

Let's break down `updateIssPosition()` line by line:

```javascript
async function updateIssPosition() {
    // 1. Try to fetch data (might fail, so we use try/catch)
    try {
        // 2. Request ISS position from API
        const response = await fetch(issApiUrl);
        
        // 3. Check if request succeeded
        if (!response.ok) throw new Error('Network response was not ok');
        
        // 4. Convert response to JavaScript object
        const data = await response.json();
        
        // 5. Extract latitude and longitude
        const { latitude, longitude } = data;
        
        // 6. Create Leaflet coordinate object
        const newLatLng = L.latLng(latitude, longitude);
        
        // 7. Move ISS marker to new position
        issMarker.setLatLng(newLatLng);
        
        // 8. Center map on ISS (with animation)
        if (isFirstLoad) {
            // First time: instant jump
            map.setView(newLatLng, 3, { animate: false });
            isFirstLoad = false;
        } else {
            // Later: smooth pan
            map.panTo(newLatLng, { animate: true, duration: 1 });
        }
        
        // 9. Update text display
        issInfo.innerHTML = `Latitude: ${latitude.toFixed(4)} | Longitude: ${longitude.toFixed(4)}`;
        
        // 10. Reset error counter (success!)
        consecutiveErrors = 0;
        
    } catch (error) {
        // If anything failed above, run this instead
        consecutiveErrors++;
        console.error("Error fetching ISS position:", error);
        issInfo.innerHTML = 'Could not retrieve ISS position.';
        
        // Stop trying after 3 failures
        if (consecutiveErrors >= MAX_ERRORS) {
            clearInterval(updateInterval);
        }
    }
}
```

## Common Modifications

### Change Update Frequency

**Current**: Updates every 5 seconds

**To change to 10 seconds**:
```javascript
// In map.js, line 107
const updateInterval = setInterval(updateIssPosition, 10000); // Changed from 5000
```

**To change to 1 second**:
```javascript
const updateInterval = setInterval(updateIssPosition, 1000);
```

**Note**: More frequent updates = more API requests. Be respectful!

### Change Map Center

**Current**: Centered on France `[46.2, 2.2]`

**To center on your location**:
```javascript
// In map.js, line 17
map.setView([YOUR_LATITUDE, YOUR_LONGITUDE], 3);
```

**Example for New York**:
```javascript
map.setView([40.7128, -74.0060], 3);
```

### Change Map Style

**Current**: OpenStreetMap standard tiles

**To use satellite imagery**:
```javascript
// Replace the tileLayer in map.js
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
}).addTo(map);
```

**Other options**: Dark mode maps, terrain maps, etc. Search "Leaflet tile providers" for more.

### Add More Information

**To display altitude**:
```javascript
// In updateIssPosition(), after getting data
const { latitude, longitude, altitude } = data;

// Update display
issInfo.innerHTML = `
    Latitude: ${latitude.toFixed(4)} | 
    Longitude: ${longitude.toFixed(4)} | 
    Altitude: ${altitude.toFixed(1)} km
`;
```

### Change Colors

**To change accent color**:
```css
/* In styles.css, :root section */
:root {
    --accent: #ff6b6b; /* Changed from cyan to red */
    --accent-glow: #ff3838;
}
```

All elements using `var(--accent)` will automatically update!

## Debugging Tips

### Browser Developer Tools

**Open**: Press `F12` or right-click → "Inspect"

**Console Tab**: See JavaScript errors and log messages
```javascript
console.log('ISS position:', latitude, longitude);
console.error('Something went wrong:', error);
```

**Network Tab**: See API requests
- Check if ISS API requests are successful
- See response data
- Check request timing

**Elements Tab**: Inspect HTML and CSS
- See actual HTML structure
- Test CSS changes in real-time
- Find element IDs and classes

### Common Issues

**Map not showing**:
1. Check console for errors
2. Verify Leaflet CDN loaded (check Network tab)
3. Ensure `#map` div exists in HTML
4. Check map container has height (CSS)

**ISS not updating**:
1. Check console for fetch errors
2. Test API directly: `https://api.wheretheiss.at/v1/satellites/25544`
3. Check Network tab for failed requests
4. Verify `setInterval` is running

**Styling issues**:
1. Use browser inspector to see computed styles
2. Check CSS file loaded (Network tab)
3. Verify CSS selectors match HTML elements
4. Check for typos in class names

### Testing Checklist

Before deploying:

- [ ] Map displays correctly
- [ ] ISS marker appears and moves
- [ ] Coordinates update every 5 seconds
- [ ] Works on mobile devices
- [ ] Works in different browsers
- [ ] Error handling works (disconnect internet to test)
- [ ] Video plays correctly
- [ ] Links work
- [ ] Page is accessible (keyboard navigation)

## Next Steps

### Ideas for Extensions

1. **Add more satellites**: Track other space objects
2. **Trail line**: Draw a path showing ISS movement
3. **Notifications**: Alert when ISS passes overhead
4. **Statistics**: Show speed, altitude, orbit time
5. **Historical data**: Show past positions
6. **Multiple markers**: Track ISS crew members
7. **3D view**: Show ISS altitude in 3D space

### Learning Resources

- **JavaScript**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **Leaflet**: [Official Tutorials](https://leafletjs.com/examples.html)
- **CSS**: [CSS-Tricks](https://css-tricks.com/)
- **APIs**: [REST API Tutorial](https://restfulapi.net/)

### Getting Help

- Check browser console for errors
- Read API documentation
- Search Stack Overflow
- Check Leaflet examples
- Review this guide again!

---

**Happy coding! 🚀**

