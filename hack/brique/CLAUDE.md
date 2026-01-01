# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Brick Face" is a p5.js-based web app that overlays an animated red brick pattern as a mask on the user's face using real-time face tracking. It's designed as a mobile-friendly PWA with iOS web app support.

## Technology Stack

- **p5.js** (v1.4.0) - Canvas rendering and animation
- **MediaPipe FaceMesh** - Real-time face landmark detection (468 points)
- **MediaPipe Camera Utils** - Webcam access and frame processing
- All dependencies loaded via CDN, no build tools required

## Development

Open `index.html` in a browser (requires camera access). For local development, use a local server to avoid CORS issues with camera access.

## Code Architecture

The app uses p5.js's setup/draw loop with MediaPipe integration:

- **Face Detection Pipeline**: Camera frames → FaceMesh → `onResults()` callback → `faces` array
- **Rendering Layers** (in `draw()`):
  1. `drawBackgroundBricks()` - Dark animated brick wall backdrop
  2. Face mask area - Uses canvas clipping with face silhouette indices to render bright bricks only within face bounds
  3. `drawEyeHoles()` - Cuts out eyes and mouth using specific landmark indices

### Key Landmark Index Groups (js/script.js)

- Face silhouette: indices 10, 338, 297... (37 points forming face outline)
- Left eye: 33, 133, 160, 159, 158, 144, 145, 153
- Right eye: 362, 263, 387, 386, 385, 373, 374, 380
- Mouth: 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291

### Coordinate System

MediaPipe returns normalized coordinates (0-1). The code mirrors X coordinates (`1 - pt.x`) and scales to screen dimensions for front-facing camera display.

## File Structure

```
index.html      - Entry point with meta tags for iOS PWA
js/script.js    - All p5.js and face tracking logic
css/styles.css  - Minimal fullscreen styling
manifest.json   - PWA manifest for "Brick Face"
rules.md        - Project organization guidelines
```
