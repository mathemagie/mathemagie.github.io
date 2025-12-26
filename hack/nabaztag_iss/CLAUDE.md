# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static web application that tracks the International Space Station (ISS) in real-time using the Leaflet mapping library and displays its current position over a world map. The page also documents a physical Nabaztag robot that wiggles its ears when the ISS flies over France (controlled by external Python code).

## Architecture

This is a **vanilla JavaScript static site** with no build process or package manager. All dependencies are loaded via CDN:

- **index.html**: Main HTML structure with Bootstrap 5.3.3 layout
- **map.js**: ISS tracking logic using the wheretheiss.at API and Leaflet for map rendering
- **styles.css**: Custom CSS with space-themed design (Orbitron/Space Mono fonts, radial gradients, glow effects)
- **nabaztag.mp4**: Demo video of the Nabaztag robot

### Key External Dependencies (CDN-loaded)

**Core Dependencies:**
- Leaflet 1.9.4 for map rendering
- Bootstrap 5.3.3 for layout
- Font Awesome 6.5.1 for icons
- Google Fonts (Orbitron, Space Mono)

**Enhanced Features (Added):**
- Leaflet.Terminator 1.0.0 for day/night overlay (~5KB)
- Leaflet.Fullscreen 1.0.1 for fullscreen control (~3KB)
- satellite.js 5.0.0 for orbital calculations and pass prediction (~50KB)

## Development Workflow

Since this is a static site, simply **open index.html in a browser** or use a local HTTP server:

```bash
# Option 1: Python simple server
python3 -m http.server 8000

# Option 2: Node.js http-server (if installed)
npx http-server -p 8000
```

Then navigate to `http://localhost:8000`

**No build, compile, or bundle steps required.**

## Code Architecture Details

### ISS Position Updates (map.js)

**Primary API Endpoint:**
- Fetches ISS data from `https://api.wheretheiss.at/v1/satellites/25544`
- Updates every 10 seconds via `setInterval(updateIssPosition, 10000)` (optimized from 5s)
- Uses async/await pattern for API calls
- Returns: latitude, longitude, altitude, velocity, visibility, footprint

**TLE Data for Pass Prediction:**
- Fetches orbital data from `https://api.wheretheiss.at/v1/satellites/25544/tles`
- Loaded once on page load, refreshed every 6 hours
- Used by satellite.js for calculating France pass predictions

**Features:**
- **Metadata Display**: Shows altitude (km), velocity (km/h), visibility status, and footprint diameter
- **Footprint Circle**: Visualizes ISS visibility range as a ~4400km diameter circle on map
- **Day/Night Overlay**: Terminator line showing Earth's sunlit and shadow regions (updates every minute)
- **Map Controls**: Fullscreen button, scale bar (metric), and "Zoom to ISS" button
- **France Pass Prediction**: Calculates next ISS pass over France with countdown timer and historical tracking
- **Loading States**: Shimmer skeleton during initial data load

### Styling Approach (styles.css)

- CSS custom properties in `:root` define the space theme color scheme
- Radial gradient background with animated starfield effect using `body::before` pseudo-element
- All interactive elements have hover states with glow effects
- Fully responsive with breakpoints at 1024px, 768px, 480px
- Touch device optimizations using `@media (hover: none) and (pointer: coarse)`

### France Pass Prediction Module (map.js)

**Location:** Lines 373-574 in map.js

**Functionality:**
- Uses Two-Line Element (TLE) orbital data from Where The ISS At API
- Calculates ISS position using satellite.js propagation
- Detects when ISS enters/exits France boundaries (41.3°N-51.1°N, 5.1°W-8.2°E)
- Displays countdown to next pass over France
- Tracks historical passes (last 5)
- Visual alert when ISS is currently over France (pulsing animation)

**Technical Details:**
- Look-ahead window: 24 hours
- Calculation interval: 30 seconds
- Minimum pass duration: 10 seconds (filters brief edge clips)
- Display updates: Every 60 seconds
- TLE refresh: Every 6 hours

**UI States:**
- **Active Pass**: "ISS is over France NOW!" with pulsing animation
- **Next Pass**: Countdown timer with start/end times and duration
- **No Pass**: Message if no passes in next 24 hours
- **History**: Collapsible details showing recent passes

### Video Interaction (index.html)

- Clicking the word "wiggles" triggers `scrollToVideo()` function
- Video auto-plays on page load (desktop only) with controls visible

## Important Notes

- The Python code that controls the physical Nabaztag robot is **external** and hosted at `https://raw.githubusercontent.com/mathemagie/nabaztag_ISS/main/ear.py`
- The home link (`/`) navigates to the parent site (pcito)
- All CSS animations are CSS-only (no JavaScript animation libraries)
- The site uses semantic HTML with proper ARIA labels for accessibility
