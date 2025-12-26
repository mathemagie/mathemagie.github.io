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

- Leaflet 1.9.4 for map rendering
- Bootstrap 5.3.3 for layout
- Font Awesome 6.5.1 for icons
- Google Fonts (Orbitron, Space Mono)

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

- Fetches ISS coordinates from `https://api.wheretheiss.at/v1/satellites/25544`
- Updates every 5 seconds via `setInterval(updateIssPosition, 5000)`
- Uses async/await pattern for API calls
- Marker position updated via `issMarker.setLatLng([latitude, longitude])`

### Styling Approach (styles.css)

- CSS custom properties in `:root` define the space theme color scheme
- Radial gradient background with animated starfield effect using `body::before` pseudo-element
- All interactive elements have hover states with glow effects
- Fully responsive with breakpoints at 1024px, 768px, 480px
- Touch device optimizations using `@media (hover: none) and (pointer: coarse)`

### Video Interaction (index.html)

- Clicking the word "wiggles" triggers `playVideo()` function
- Video auto-plays on page load with controls visible

## Important Notes

- The Python code that controls the physical Nabaztag robot is **external** and hosted at `https://raw.githubusercontent.com/mathemagie/nabaztag_ISS/main/ear.py`
- The home link (`/`) navigates to the parent site (pcito)
- All CSS animations are CSS-only (no JavaScript animation libraries)
- The site uses semantic HTML with proper ARIA labels for accessibility
