# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a p5.js-based web visualization project that renders an animated red brick pattern. The project consists of a single HTML file that creates a dynamic, floating brick wall effect with lighting variations.

## Technology Stack

- **p5.js** (v1.4.0) - Creative coding library loaded via CDN
- Pure JavaScript for animation logic
- No build tools or package management required

## Code Architecture

The visualization uses p5.js's standard setup/draw pattern:

- `setup()`: Initializes canvas and color scheme
- `draw()`: Main animation loop that renders the brick pattern with:
  - Staggered brick arrangement (alternating row offsets)
  - Floating motion effects using sine/cosine functions
  - Dynamic lighting shifts
  - Shadow and highlight rendering for depth
- `drawBrick()`: Renders individual bricks with lighting effects
- `windowResized()`: Handles responsive canvas resizing

## Development

Since this is a standalone HTML file with no build process:

1. Open `index.html` directly in a web browser to view the visualization
2. Edit the JavaScript code within the `<script>` tags
3. Refresh the browser to see changes

## Key Variables and Effects

- `brickColorBase`: Base red color for bricks (RGB: 180, 60, 50)
- `animationTime`: Controls the floating and lighting animation cycles
- `lightShiftOffset`: Creates subtle lighting variations across the pattern
- Brick dimensions are responsive, calculated as 1/8 of window width