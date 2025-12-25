# Technical Documentation - Nabaztag ISS Tracker

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Component Documentation](#component-documentation)
4. [API Integration](#api-integration)
5. [Configuration](#configuration)
6. [Performance Considerations](#performance-considerations)
7. [Browser Compatibility](#browser-compatibility)
8. [Accessibility](#accessibility)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

The Nabaztag ISS Tracker is a real-time web application that visualizes the International Space Station's current position on an interactive world map. The application fetches live ISS coordinates and displays them using the Leaflet mapping library.

### Key Features

- **Real-Time Tracking**: Updates ISS position every 5 seconds
- **Interactive Map**: Leaflet-based map with zoom controls (levels 2-20)
- **World View**: Default zoom level 2 for global context
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Error Handling**: Graceful degradation with error tracking

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Mapping**: Leaflet.js 1.9.4
- **API**: Where The ISS At API (REST)
- **Icons**: Font Awesome 6.5.1
- **Fonts**: Google Fonts (Orbitron, Space Mono)
- **No Build Tools**: Pure static site, no compilation required

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Web Browser                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  index.html  │  │   map.js     │  │  styles.css  │  │
│  │   (Structure)│  │  (Logic)     │  │  (Styling)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                  │                             │
│         └──────────┬───────┘                             │
│                    │                                     │
│              ┌─────▼─────┐                              │
│              │  Leaflet  │                              │
│              │    Map     │                              │
│              └─────┬─────┘                              │
└────────────────────┼─────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐          ┌──────▼──────┐
    │  ISS    │          │ OpenStreet  │
    │   API   │          │    Map      │
    │         │          │   Tiles     │
    └─────────┘          └─────────────┘
```

### Data Flow

1. **Page Load**: HTML structure loads, CSS applies styling
2. **Map Initialization**: Leaflet map initializes with world view (zoom 2)
3. **ISS Position Fetch**: JavaScript fetches ISS coordinates from API
4. **Map Update**: Marker position updated, map centers on ISS
5. **Continuous Updates**: setInterval triggers updates every 5 seconds
6. **Error Handling**: Failed requests tracked, updates stop after 3 consecutive errors

---

## Component Documentation

### 1. HTML Structure (`index.html`)

#### Meta Tags and SEO

```html
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="twitter:card" content="summary_large_image">
```

**Purpose**: Provides search engine optimization and social media sharing metadata.

#### Key Sections

- **Header**: Site title and home navigation link
- **Description Blocks**: Three content cards explaining the project
- **Video Element**: Embedded demonstration video with captions
- **ISS Info Display**: Real-time coordinate display
- **Map Container**: Leaflet map rendering area

#### Accessibility Features

- `aria-label` attributes on interactive elements
- `aria-live="polite"` on ISS info for screen reader updates
- `sr-only` class for screen-reader-only text
- Semantic HTML5 elements (`<header>`, `<main>`, `<article>`)

### 2. JavaScript Logic (`map.js`)

#### Constants and Configuration

```javascript
const issApiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';
const MAX_ERRORS = 3;
```

**Configuration Values**:
- **API URL**: Where The ISS At API endpoint for ISS (NORAD ID: 25544)
- **Max Errors**: Maximum consecutive API failures before stopping updates
- **Update Interval**: 5000ms (5 seconds)

#### Map Initialization

```javascript
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false,
    tap: true,
    tapTolerance: 15,
    zoomDelta: 0.25,
    zoomSnap: 0.25
}).setView([0, 0], 2);
```

**Settings Explained**:
- `scrollWheelZoom: false` - Prevents accidental zooming
- `tap: true` - Enables touch interactions on mobile
- `tapTolerance: 15` - Increases tap area for better mobile UX
- `zoomDelta: 0.25` - Smaller zoom increments for smoother control
- `zoomSnap: 0.25` - Allows fractional zoom levels
- Initial view: `[0, 0], 2` - World view at zoom level 2

#### Tile Layer Configuration

```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 20,
    minZoom: 2
}).addTo(map);
```

**Tile Layer Details**:
- **Provider**: OpenStreetMap (free, open-source)
- **URL Pattern**: `{s}` = subdomain (a, b, c), `{z}` = zoom, `{x}/{y}` = tile coordinates
- **Zoom Range**: 2 (world) to 20 (street level)
- **Attribution**: Required by OpenStreetMap license

#### ISS Marker

```javascript
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
});

const issMarker = L.marker([0, 0], {
    icon: issIcon,
    title: 'International Space Station',
    riseOnHover: true
}).addTo(map);
```

**Marker Properties**:
- **Icon**: SVG from Wikipedia Commons (International Space Station)
- **Size**: 50x50 pixels
- **Anchor**: Center point (25, 25)
- **Rise on Hover**: Marker elevates when hovered for better visibility

#### Position Update Function

```javascript
async function updateIssPosition() {
    try {
        const response = await fetch(issApiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const { latitude, longitude } = data;
        
        // Validate coordinates
        if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
            isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Invalid coordinates received from API');
        }
        
        const newLatLng = L.latLng(latitude, longitude);
        issMarker.setLatLng(newLatLng);
        
        if (isFirstLoad) {
            map.setView(newLatLng, 2, { animate: false });
            isFirstLoad = false;
        } else {
            map.panTo(newLatLng, { animate: true, duration: 1 });
        }
        
        issInfo.innerHTML = `Latitude: ${latitude.toFixed(4)} | Longitude: ${longitude.toFixed(4)}`;
        consecutiveErrors = 0;
        
    } catch (error) {
        consecutiveErrors++;
        console.error("Error fetching ISS position:", error);
        issInfo.innerHTML = 'Could not retrieve ISS position. Please try again later.';
        
        if (consecutiveErrors >= MAX_ERRORS) {
            clearInterval(window.updateInterval);
        }
    }
}
```

**Function Behavior**:
1. **Fetch**: Uses Fetch API to get ISS position
2. **Validate**: Checks for valid numeric coordinates
3. **Update Marker**: Moves ISS marker to new position
4. **Center Map**: First load centers at zoom 2, subsequent updates pan smoothly
5. **Update Display**: Shows coordinates with 4 decimal precision
6. **Error Handling**: Tracks consecutive failures, stops after 3 errors

#### Initialization Sequence

```javascript
function initializeIssTracking() {
    updateIssPosition();
    window.updateInterval = setInterval(updateIssPosition, 5000);
}

// Multiple initialization methods for reliability
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        map.whenReady(initializeIssTracking);
    });
} else {
    map.whenReady(initializeIssTracking);
}

// Fallback initialization
setTimeout(function() {
    if (isFirstLoad) {
        initializeIssTracking();
    }
}, 1000);
```

**Initialization Strategy**:
- Waits for DOM to be ready
- Waits for map tiles to load (`map.whenReady()`)
- Fallback timeout ensures initialization even if events don't fire
- Prevents multiple simultaneous initializations

### 3. CSS Styling (`styles.css`)

#### Design System

```css
:root {
    --primary-bg: #0a0e27;
    --primary-color: #e8f4f8;
    --accent: #00d4ff;
    --accent-glow: #0095ff;
    --card-bg: #1a1f3a;
    --card-border: rgba(0, 212, 255, 0.2);
}
```

**Color Palette**:
- **Primary Background**: Deep space blue (#0a0e27)
- **Text Color**: Light cyan (#e8f4f8)
- **Accent**: Bright cyan (#00d4ff)
- **Cards**: Dark blue with transparency (#1a1f3a)

#### Starfield Background

```css
body::before {
    content: '';
    position: fixed;
    background-image: radial-gradient(...);
    background-size: 200% 200%, 180% 180%, ...;
    opacity: 0.5;
    z-index: 1;
}
```

**Effect**: Creates animated starfield using multiple radial gradients with different sizes and positions.

#### Map Styling

```css
.iss-map {
    height: 450px;
    max-width: 680px;
    filter: contrast(1.15) brightness(1.1) saturate(1.2);
}

.iss-map .leaflet-container {
    background-color: #1a1f3a;
}

.iss-map .leaflet-tile-container img {
    filter: contrast(1.1) brightness(1.05);
}
```

**Enhancements**:
- Fixed height for consistent layout
- CSS filters improve map contrast and visibility
- Dark background matches theme

#### Responsive Breakpoints

- **Desktop**: 1024px+ (full layout)
- **Tablet**: 768px - 1023px (adjusted font sizes)
- **Mobile**: 480px - 767px (compact layout)
- **Small Mobile**: < 480px (minimal layout)

#### Accessibility Features

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

**Reduced Motion**: Respects user's motion preferences for accessibility.

---

## API Integration

### Where The ISS At API

#### Endpoint

```
GET https://api.wheretheiss.at/v1/satellites/25544
```

**NORAD ID**: 25544 (International Space Station)

#### Response Format

```json
{
  "name": "iss",
  "id": 25544,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "altitude": 408.5,
  "velocity": 27600.0,
  "visibility": "daylight",
  "footprint": 4446.0,
  "timestamp": 1704067200,
  "units": "kilometers"
}
```

#### Fields Used

- `latitude`: Current latitude (-90 to 90)
- `longitude`: Current longitude (-180 to 180)

#### Rate Limiting

- **No API key required**
- **Recommended**: Updates every 5 seconds
- **Free tier**: Suitable for personal/educational use

#### Error Handling

```javascript
try {
    const response = await fetch(issApiUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    // ... process data
} catch (error) {
    consecutiveErrors++;
    if (consecutiveErrors >= MAX_ERRORS) {
        clearInterval(window.updateInterval);
    }
}
```

**Error Strategy**:
- Tracks consecutive failures
- Stops updates after 3 consecutive errors
- Displays user-friendly error message
- Logs errors to console for debugging

---

## Configuration

### Adjusting Update Frequency

```javascript
// In map.js, change the interval
window.updateInterval = setInterval(updateIssPosition, 5000); // 5 seconds
// To 10 seconds:
window.updateInterval = setInterval(updateIssPosition, 10000);
```

### Changing Initial Zoom Level

```javascript
// In map.js
map.setView([0, 0], 2); // World view (current)
// For closer view:
map.setView([0, 0], 5); // Regional view
```

### Customizing Map Tiles

```javascript
// Replace OpenStreetMap with different provider
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
}).addTo(map);
```

### Modifying ISS Marker

```javascript
// Change icon size
const issIcon = L.icon({
    iconUrl: 'your-icon-url.svg',
    iconSize: [60, 60], // Larger icon
    iconAnchor: [30, 30]
});
```

### Color Customization

```css
/* In styles.css */
:root {
    --accent: #ff6b6b; /* Change to red */
    --accent-glow: #ff3838;
}
```

---

## Performance Considerations

### Optimization Strategies

1. **CDN Resources**: All external libraries loaded from CDN
2. **Preconnect Hints**: DNS prefetching for faster resource loading
3. **Lazy Loading**: Video uses `preload="metadata"` instead of auto
4. **Efficient Updates**: Only updates marker position, not entire map
5. **Error Throttling**: Stops updates after repeated failures

### Resource Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://api.wheretheiss.at">
```

**Preconnect**: Establishes early connections to reduce latency.

### Memory Management

- Map instance stored globally for resize handler
- Interval ID stored in `window.updateInterval` for cleanup
- No memory leaks from event listeners (proper cleanup)

---

## Browser Compatibility

### Supported Browsers

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Required Features

- **ES6+ JavaScript**: async/await, fetch API, arrow functions
- **CSS Custom Properties**: For theming
- **CSS Grid/Flexbox**: For layout
- **Fetch API**: For API requests

### Polyfills (if needed)

For older browsers, consider:
- `fetch` polyfill
- `Promise` polyfill
- CSS custom properties polyfill

---

## Accessibility

### ARIA Labels

```html
<button class="wiggle-trigger" aria-label="Scroll to video of Nabaztag wiggling">
<div id="iss-info" aria-live="polite">
```

**ARIA Features**:
- `aria-label`: Descriptive labels for screen readers
- `aria-live="polite"`: Announces ISS position updates
- `sr-only`: Screen-reader-only text for context

### Keyboard Navigation

- All interactive elements keyboard accessible
- Focus indicators visible
- Tab order logical

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
    }
}
```

Respects user's motion preferences.

---

## Troubleshooting

### Map Not Displaying

**Symptoms**: Blank map area

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify Leaflet CDN is accessible
3. Check internet connection (map tiles load from OpenStreetMap)
4. Clear browser cache
5. Verify `#map` element exists in HTML

### ISS Position Not Updating

**Symptoms**: Marker stuck, coordinates not changing

**Solutions**:
1. Check browser console for fetch errors
2. Test API directly: `https://api.wheretheiss.at/v1/satellites/25544`
3. Check Network tab in DevTools for failed requests
4. Verify CORS is enabled (API should allow cross-origin)
5. Check if error counter reached MAX_ERRORS (3)

### Marker Not Visible

**Symptoms**: Map loads but no ISS marker

**Solutions**:
1. Check if marker icon URL is accessible
2. Verify marker position is valid (not NaN)
3. Check if map is zoomed too far out (marker might be off-screen)
4. Inspect marker element in DevTools
5. Verify `issMarker` is added to map

### Performance Issues

**Symptoms**: Slow updates, laggy map

**Solutions**:
1. Reduce update frequency (increase interval)
2. Check for multiple map instances
3. Verify no memory leaks in console
4. Check network speed (tile loading)
5. Disable map filters if causing slowdown

### Video Not Playing

**Symptoms**: Video element shows but doesn't play

**Solutions**:
1. Check video file path is correct
2. Verify video format (MP4 with H.264)
3. Check browser codec support
4. Mobile browsers may require user interaction
5. Check `captions_en.vtt` file exists (prevents 404)

---

## Code Examples

### Custom Update Interval

```javascript
// Update every 10 seconds instead of 5
const updateInterval = setInterval(updateIssPosition, 10000);
```

### Custom Zoom on Load

```javascript
if (isFirstLoad) {
    map.setView(newLatLng, 5, { animate: false }); // Regional view
    isFirstLoad = false;
}
```

### Adding Custom Marker

```javascript
const customMarker = L.marker([latitude, longitude], {
    icon: customIcon
}).addTo(map);
```

### Listening to Map Events

```javascript
map.on('zoomend', function() {
    console.log('Zoom level:', map.getZoom());
});

map.on('moveend', function() {
    console.log('Center:', map.getCenter());
});
```

---

## Version History

### Current Version Features

- World view (zoom level 2) by default
- Maximum zoom level 20
- Improved map contrast with CSS filters
- Video captions support
- Enhanced error handling
- Mobile-optimized touch interactions
- Accessibility improvements

---

## References

- [Leaflet Documentation](https://leafletjs.com/)
- [Where The ISS At API](https://wheretheiss.at/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2024  
**Maintainer**: Mathemagie  
**License**: Open Source

