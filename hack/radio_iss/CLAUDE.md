# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a "Radio ISS" application - an immersive ISS (International Space Station) tracker that combines real-time visualization with location-based internet radio streaming. The app displays a particle physics simulation where the ISS is visualized as a pulsating red particle moving based on its actual orbital position, while continent-based particles create dynamic interactions. As the ISS travels, the radio automatically switches between regional stations.

## Architecture

**Modular application**: The project consists of:
- `index.html` - Main HTML structure that loads all components
- `css/styles.css` - All styling including radio UI and visual effects
- `js/main.js` - Core application setup, particle management, and draw loop
- `js/radio.js` - RadioManager class handling station switching and audio controls
- `js/geography.js` - GeographyManager class for ISS tracking and coordinate conversion  
- `js/particles.js` - Particle class with physics simulation and visual effects
- p5.js library (v1.4.0) loaded from CDN for canvas-based graphics

**Core Components**:

### Radio System (`js/radio.js`)
- **RadioManager Class**: Handles all radio functionality and UI management
- **Regional Radio Mapping**: 7 regions (Ocean, North America, South America, Europe, Africa, Asia, Oceania) each mapped to specific internet radio stations
- **Auto-switching Logic**: `getRegion(lat, lon)` method determines current region based on ISS coordinates
- **Station Management**: `setStationForRegion()` handles seamless audio transitions
- **UI Elements**: Fixed position radio UI with station display and audio controls

### Particle Physics Engine (`js/particles.js`)
- **Particle Class**: Advanced physics with multiple states (stationary, moving, resetting)
- **ISS Particle**: Special red particle with heartbeat visual effect and steering behavior toward real coordinates
- **Continent Particles**: Positioned along continent outlines, activate when hit by ISS
- **Collision System**: Elastic collisions with momentum conservation, separation handling
- **Visual Effects**: Soap bubble reset animation, glow rings, transparency effects

### Geographic System (`js/geography.js`)
- **GeographyManager Class**: Handles coordinate conversion and ISS tracking
- **Continent Mapping**: Simplified polygon outlines for all continents stored as lat/lon coordinates
- **Coordinate Conversion**: `latLonToXY()` converts geographic coordinates to screen space
- **Continent Point Generation**: Creates particle spawn points along continent boundaries with inland variations
- **Resize Handling**: Repositions particles when canvas dimensions change

### ISS Tracking (`js/geography.js`)
- **Real Mode**: Fetches actual ISS coordinates from `https://api.wheretheiss.at/v1/satellites/25544` every 5 seconds
- **Debug Mode**: Simulation mode (`?debug=1` URL parameter) cycles through predefined global positions for testing
- **Steering Behavior**: ISS particle smoothly moves toward target coordinates using vector math
- **Geographic Persistence**: Maintains particle positions across window resizes

## Key Features

**Radio Streaming**:
- SomaFM Mission Control (Ocean), KEXP Seattle (North America), Radio Paradise World (South America)
- Radio Swiss Pop (Europe), RFI Monde (Africa), SomaFM Groove Salad (Asia), SomaFM Space Station Soma (Oceania)
- Automatic region detection and station switching as ISS orbits
- Persistent playback state across station changes

**Visual Effects**:
- ISS heartbeat pulse animation with double-beat pattern
- Soap bubble reset effect when ISS collides with continent particles
- Continent outline visualization (press 'm' key to toggle)
- Particle attraction to nearest continent points to maintain geographic clustering

**Physics Simulation**:
- Realistic elastic collisions between particles
- Moving particles activate stationary ones on contact
- Edge bouncing for regular particles (ISS wraps around)
- Smooth separation handling to prevent particle overlap

## File Structure

```
radio_iss/
├── index.html          # Main HTML file that loads all components
├── css/
│   └── styles.css      # All styling for UI and visual effects
├── js/
│   ├── main.js         # Core application setup and draw loop
│   ├── radio.js        # RadioManager class
│   ├── geography.js    # GeographyManager class  
│   └── particles.js    # Particle class with physics
└── CLAUDE.md           # This documentation file
```

## Development

**Running the application**: Simply open `index.html` in a web browser - no build process required.

**Testing**: Run unit tests with Vitest:
```bash
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```
Tests are located in `tests/` directory and cover core functionality of RadioManager and GeographyManager classes.

**Linting**: Code quality is maintained with multiple linters:
```bash
npm run lint       # Run all linters (HTML, JS, CSS)
npm run lint:html  # HTMLHint for HTML files
npm run lint:js    # ESLint for JavaScript files  
npm run lint:css   # Stylelint for CSS files
npm run lint:fix   # Auto-fix JavaScript issues
```

**Pre-commit Hooks**: Automated quality checks run before each commit:
- HTML linting with HTMLHint
- JavaScript linting with ESLint (auto-fix enabled)
- CSS linting with Stylelint (auto-fix enabled)  
- Unit tests execution
- All checks must pass before commit is allowed

**Cache-Busting for Development**: When making changes to CSS/JS files, update cache-busting parameters in `index.html`:
```bash
# Get current timestamp
date +%s

# Update index.html with new timestamp for all CSS/JS files:
# <link rel="stylesheet" href="css/styles.css?v=NEW_TIMESTAMP">
# <script src="js/main.js?v=NEW_TIMESTAMP"></script>
# (Apply to all CSS and JS file references)
```
This forces browsers to reload updated files instead of using cached versions, essential for testing changes during development iterations.

**Debug Features**:
- Add `?debug=1` to URL for simulation mode (cycles through all regions)
- Press 'm' key to visualize continent outline points  
- Press 'f' key to toggle fullscreen
- Radio UI shows current station and region information

**External dependencies**: 
- p5.js 1.4.0 (CDN)
- Where the ISS at API
- Various internet radio streams (MP3 format)