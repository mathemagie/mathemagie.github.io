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
- **Regional Radio Mapping**: Granular geographic regions (20+ specific areas like US West, US East, Western Europe, Northern Europe, East Asia, Southeast Asia, etc.) mapped to internet radio stations
- **Auto-switching Logic**: `getRegion(lat, lon)` method uses precise lat/lon bounds to determine current region based on ISS coordinates
- **Station Management**: `setStationForRegion()` handles seamless audio transitions with dual audio players for crossfading
- **UI Elements**: Fixed position radio UI with station display, playback controls, and helpful hints
- **Context Overlay**: ISS position, current region, and next pass ETA (accessible via 'i' key)

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
- 20+ regional radio stations covering all continents with granular geographic coverage
- Examples: KEXP (US West), WFMU (US East), Radio Swiss Pop (Western Europe), NTS Radio (Northern Europe), Radio Paradise (Southeast Asia), and many more
- Automatic region detection using precise lat/lon boundaries (respects ISS ±51.6° orbital limit)
- Seamless station switching with dual audio player crossfading as ISS orbits
- Persistent playback state and volume across station changes

**Visual Effects**:
- ISS heartbeat pulse animation with double-beat pattern
- Soap bubble reset effect when ISS collides with continent particles
- Continent outline visualization (press 'm' key to toggle)
- Path trace visualization showing ISS trajectory (toggle via 'i' key overlay)
- Particle attraction to nearest continent points to maintain geographic clustering

**UI Features**:
- Fixed position radio UI with station display and playback controls
- ISS context overlay (press 'i') showing current position, region, and next pass ETA
- Fullscreen mode (press 'f' or use button)
- Responsive design for mobile and desktop

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
Tests are located in `tests/` directory and cover:
- **RadioManager**: Region detection, station switching, audio controls
- **GeographyManager**: Coordinate conversions, ISS tracking  
- **Resize functionality**: Comprehensive coverage of window resize and fullscreen behavior including:
  - Particle repositioning during resize operations
  - Geographic data persistence across canvas dimension changes
  - ISS particle wrapping and bounds handling
  - Particle state preservation (moving, resetting, collision states)
  - Velocity limiting and coordinate conversion accuracy
  - Error handling for missing data scenarios

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

**IMPORTANT - Cache-Busting System**:
- **Development (localhost)**: Cache-busting is automatic - random IDs are generated on each page load
- **Production**: Cache-busting uses timestamps that MUST be updated after modifying CSS or JS files

To update production cache-busting timestamps:
```bash
# Get current timestamp
TIMESTAMP=$(date +%s)

# Update index.html manually with new timestamp for ALL CSS/JS files:
# For CSS: <link rel="stylesheet" href="css/styles.css?v=TIMESTAMP">
# For JS: <script src="js/particles.js?v=TIMESTAMP"></script> (repeat for radio.js, geography.js, main.js)

# Or use find/replace to update all occurrences of the old timestamp
```
**CRITICAL**: When modifying CSS or JS files, update the production timestamps in `index.html` to force browsers to reload the updated files. This is essential for deployed versions.

**Utility Scripts**:
```bash
./update-version.sh        # Update version comment with latest git commit hash
./verify-deployment.sh     # Verify deployment integrity (production)
```

**Debug Features**:
- Add `?debug=1` to URL for simulation mode (cycles through all regions)
- Press 'm' key to visualize continent outline points
- Press 'f' key to toggle fullscreen
- Press 'i' key to toggle ISS context overlay (shows position, region, next ETA)
- Radio UI shows current station and region information
- Path trace feature can be toggled from ISS context overlay (persisted in localStorage)

**External dependencies**: 
- p5.js 1.4.0 (CDN)
- Where the ISS at API
- Various internet radio streams (MP3 format)
