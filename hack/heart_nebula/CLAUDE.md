# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Heart Nebula is a web-based interactive nebula visualization featuring a smooth, breathing animation effect controlled by CSS filters and transforms. The project is designed to work as a standalone web page and iOS web app.

## Project Structure

```
.
├── index.html          # Main HTML file with controls UI
├── css/
│   └── styles.css      # All styles including keyframe animation
├── js/
│   └── script.js       # Animation control logic
├── nebu.jpg            # Background nebula image
├── .htmlhintrc         # HTML linting configuration
└── rules.md            # Project organization guidelines
```

## Key Architecture Concepts

### Dynamic CSS Keyframe System

The core innovation is runtime-generated CSS custom properties that control a breathing animation:

- **Sine Wave Interpolation**: `updatePulse()` in js/script.js:44 calculates smooth transitions using sine waves across 28 keyframe points (0%, 3%, 6%...100%)
- **CSS Variables**: Each keyframe percentage gets 4 CSS variables set dynamically on document root:
  - `--brightness-{percent}`: Controls image brightness
  - `--saturation-{percent}`: Controls color saturation
  - `--hue-{percent}`: Controls hue rotation
  - `--scale-{percent}`: Controls scale transform
- **Keyframe Animation**: The `pulse` animation in css/styles.css:177 references these variables at each keyframe

This architecture allows real-time animation parameter changes without redefining the entire animation.

### Debug Mode System

Controls are hidden by default and only visible when `?debug=1` is in the URL:

- Debug mode check: js/script.js:2-3
- Controls visibility: css/styles.css:36-41, css/styles.css:62-68
- When debug mode is off, users see only the pulsing nebula and fullscreen button

### Mobile/iOS Web App Support

The page is configured as an iOS web app with fullscreen capabilities:

- Viewport settings prevent zooming: index.html:5
- iOS-specific meta tags: index.html:7-9
- Apple touch icons and startup images: index.html:11-15
- Fullscreen button hidden on mobile: css/styles.css:160-164

## Development Commands

### Testing Locally

```bash
# Serve the project (requires a local web server)
python3 -m http.server 8000
# Then open http://localhost:8000

# Or with Node.js
npx serve
```

### HTML Linting

```bash
# Install htmlhint if needed
npm install -g htmlhint

# Run linting
htmlhint index.html
```

Configuration in `.htmlhintrc` enforces lowercase tags/attributes, double quotes, HTML5 doctype, and dash-separated IDs/classes.

## Animation Parameters

All animation parameters are controlled through range inputs (when debug mode is enabled):

- **Speed** (2-12s): Animation cycle duration
- **Brightness** (0.8-1.8): Filter brightness range
- **Colors** (1.0-1.6): Saturation multiplier
- **Hue Shift** (0-20°): Maximum hue rotation
- **Size Pulse** (1.000-1.050): Scale transform range

The `updatePulse()` function recalculates all 28 keyframes whenever any parameter changes, using sine wave math to create smooth, natural breathing patterns with micro-variations for realism (js/script.js:68).

## Code Conventions

Based on rules.md:

- JavaScript files go in `js/` directory
- CSS files go in `css/` directory
- Mobile-first approach with iOS web app meta tags
- Viewport set to prevent user scaling for app-like experience
