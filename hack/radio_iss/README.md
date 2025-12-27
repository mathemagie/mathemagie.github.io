# 25544.fm - ISS Orbital Radio

An immersive ISS (International Space Station) tracker that combines real-time space station visualization with location-based internet radio streaming. Watch the ISS orbit Earth as a pulsating particle in a physics simulation while listening to regional radio stations that automatically switch based on the ISS's current location.

**25544** is the NORAD catalog number for the International Space Station.

![25544.fm Demo](https://img.shields.io/badge/Demo-Live-brightgreen)

## Features

### 🛰️ Real-Time ISS Tracking
- Live ISS position data from the "Where the ISS at?" API
- Updates every 5 seconds with actual orbital coordinates
- Smooth particle movement with realistic physics

### 📻 Location-Based Radio Streaming
- **7 Regional Radio Stations**:
  - **Ocean**: SomaFM Mission Control
  - **North America**: KEXP Seattle
  - **South America**: Radio Paradise World
  - **Europe**: Radio Swiss Pop
  - **Africa**: RFI Monde
  - **Asia**: SomaFM Groove Salad
  - **Oceania**: SomaFM Space Station Soma
- Automatic station switching as the ISS orbits different regions
- Seamless audio transitions with persistent playback controls

### 🎨 Interactive Particle Physics
- **ISS Particle**: Red pulsating particle with heartbeat animation
- **Continent Particles**: Positioned along continent outlines
- **Collision System**: Realistic elastic collisions with momentum conservation
- **Visual Effects**: Soap bubble animations, glow rings, and transparency effects

### 🌍 Geographic Visualization
- Simplified continent outlines mapped to particle positions
- Coordinate conversion from latitude/longitude to screen space
- Continent outline visualization (toggle with 'm' key)

## Quick Start

1. **Open `index.html`** in any modern web browser
2. **Allow audio playback** when prompted
3. **Watch the ISS orbit** as the red pulsating particle
4. **Listen to regional radio** that changes based on ISS location
5. **Press 'f'** for fullscreen mode
6. **Press 'm'** to toggle continent outline visualization

## Controls

- **'f' key**: Toggle fullscreen mode
- **'m' key**: Show/hide continent outline points
- **Fullscreen button**: Enter/exit fullscreen mode
- **Audio controls**: Standard play/pause/volume controls

## Development

### Structure
This is a **single-file application** - everything is contained in `index.html`:
- HTML structure with embedded CSS and JavaScript
- p5.js library (v1.4.0) for canvas-based graphics
- Real-time API integration for ISS position data
- Regional radio streaming logic

### Debug Mode
Add `?debug=1` to the URL for simulation mode:
```
file:///path/to/index.html?debug=1
```
This cycles through predefined global positions for testing all regions.

### Dependencies
- **p5.js 1.4.0** (loaded from CDN)
- **Where the ISS at API** (`https://api.wheretheiss.at/v1/satellites/25544`)
- **Internet radio streams** (various MP3 sources)

## Technical Details

### Architecture
- **Single HTML file** containing all code and styling
- **Real-time data fetching** every 5 seconds
- **Advanced particle physics** with collision detection
- **Regional mapping system** for automatic radio switching

### Key Components
- **Radio System**: Region detection and station management
- **Particle Engine**: Physics simulation with multiple particle types
- **Geographic System**: Continent mapping and coordinate conversion
- **ISS Tracking**: Real-time position fetching with smooth interpolation

### Visual Effects
- ISS heartbeat pulse animation (double-beat pattern)
- Soap bubble reset effect on collisions
- Particle attraction to maintain geographic clustering
- Edge bouncing for regular particles (ISS wraps around screen)

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- Web Audio API
- Fetch API
- ES6+ JavaScript features

## License

Open source project - feel free to modify and share!

---

**Experience the ISS orbit in real-time while discovering radio stations from around the world** 🚀📻