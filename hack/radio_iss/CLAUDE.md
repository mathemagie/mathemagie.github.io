# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a "Radio ISS" application - an immersive ISS (International Space Station) tracker that combines real-time visualization with location-based internet radio streaming. The app displays a particle physics simulation where the ISS is visualized as a pulsating red particle moving based on its actual orbital position, while continent-based particles create dynamic interactions. As the ISS travels, the radio automatically switches between regional stations.

## Architecture

**Single-file application**: The entire project consists of one HTML file (`index.html`) containing:
- HTML structure with embedded CSS and JavaScript
- p5.js library (v1.4.0) loaded from CDN for canvas-based graphics
- Real-time ISS position fetching from the "Where the ISS at?" API
- Region-based internet radio streaming with automatic station switching
- Advanced particle physics simulation with collision detection and visual effects

**Core Components**:

### Radio System
- **Regional Radio Mapping**: 7 regions (Ocean, North America, South America, Europe, Africa, Asia, Oceania) each mapped to specific internet radio stations
- **Auto-switching Logic**: `getRegion(lat, lon)` function determines current region based on ISS coordinates
- **Station Management**: `setStationForRegion()` handles seamless audio transitions
- **UI Elements**: Fixed position radio UI with station display and audio controls

### Particle Physics Engine
- **Particle Class**: Advanced physics with multiple states (stationary, moving, resetting)
- **ISS Particle**: Special red particle with heartbeat visual effect and steering behavior toward real coordinates
- **Continent Particles**: Positioned along continent outlines, activate when hit by ISS
- **Collision System**: Elastic collisions with momentum conservation, separation handling
- **Visual Effects**: Soap bubble reset animation, glow rings, transparency effects

### Geographic System
- **Continent Mapping**: Simplified polygon outlines for all continents stored as lat/lon coordinates
- **Coordinate Conversion**: `latLonToXY()` converts geographic coordinates to screen space
- **Continent Point Generation**: Creates particle spawn points along continent boundaries with inland variations

### ISS Tracking
- **Real Mode**: Fetches actual ISS coordinates from `https://api.wheretheiss.at/v1/satellites/25544` every 5 seconds
- **Debug Mode**: Simulation mode (`?debug=1` URL parameter) cycles through predefined global positions for testing
- **Steering Behavior**: ISS particle smoothly moves toward target coordinates using vector math

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

## Development

**Running the application**: Simply open `index.html` in a web browser - no build process required.

**Debug Features**:
- Add `?debug=1` to URL for simulation mode (cycles through all regions)
- Press 'm' key to visualize continent outline points
- Radio UI shows current station and region information

**External dependencies**: 
- p5.js 1.4.0 (CDN)
- Where the ISS at API
- Various internet radio streams (MP3 format)