# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ISS (International Space Station) Tracker visualization built as a single-page HTML application. It displays a real-time particle physics simulation where the ISS is represented as a red particle that moves based on its actual orbital position, while other colorful particles interact through collision dynamics.

## Architecture

**Single-file application**: The entire project consists of one HTML file (`index.html`) containing:
- HTML structure with embedded CSS and JavaScript
- p5.js library loaded from CDN for canvas-based graphics
- Real-time ISS position fetching from the "Where the ISS at?" API
- Particle physics simulation with collision detection

**Core Components**:
- `Particle` class: Handles particle physics, collision detection, and rendering
- ISS tracking: Fetches real ISS coordinates every 5 seconds from `https://api.wheretheiss.at/v1/satellites/25544`
- Coordinate mapping: Converts latitude/longitude to canvas coordinates
- Physics simulation: Particles start stationary but begin moving when collided with by moving particles

## Development

**Running the application**: Simply open `index.html` in a web browser - no build process required.

**Key behavior**:
- ISS particle (red, larger) moves toward its real-world position using steering behavior
- Regular particles (random colors) start stationary but activate on collision with moving particles
- All particles bounce off canvas edges
- Position updates every 5 seconds via API calls

**External dependencies**: p5.js (loaded from CDN), Where the ISS at API