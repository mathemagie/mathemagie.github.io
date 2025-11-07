# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WebGL 2-based interactive lava lamp simulation. The entire application is contained in a single HTML file ([index.html](index.html)) with embedded shaders, JavaScript, and CSS.

## Architecture

### Rendering Pipeline
- **WebGL 2 Context**: Requires WebGL 2 support for GLSL ES 3.00 shaders
- **Full-screen Quad**: Renders to a single quad covering the viewport
- **Fragment Shader-based**: All visual effects computed per-pixel in the fragment shader

### Key Components

#### Shaders
- **Vertex Shader** (lines 166-174): Simple pass-through that transforms clip space to screen space
- **Fragment Shader** (lines 177-347): Contains all rendering logic:
  - Simplex noise implementation (lines 195-232) for organic movement
  - Metaball distance field calculation (lines 235-238)
  - Convection flow simulation (lines 241-250)
  - Lighting, glow, and chromatic aberration effects

#### Physics Simulation
The lava lamp behavior is achieved through:
- **Metaballs**: Smooth blob shapes using inverse-square distance fields
- **Convection Flow**: Thermal convection simulation (warmer fluid rises in center, cooler fluid descends at edges)
- **Noise-based Perturbation**: Simplex noise adds organic, chaotic motion to blob trajectories
- **Golden Ratio Distribution**: Blobs distributed using φ (1.618) for natural spacing

#### Interactive Parameters
All controlled via `params` object (lines 155-163):
- `blobCount`: Number of metaballs (3-20)
- `speed`: Animation speed multiplier
- `viscosity`: Affects convection and noise influence
- `blobSize`: Base radius of metaballs
- `blobColor` / `liquidColor`: RGB color values
- `lightIntensity`: Brightness multiplier

### Rendering Flow
1. **init()** (lines 383-415): Creates shader program, vertex buffer, sets up event listeners
2. **animate()** (lines 499-547): Main render loop
   - Updates uniforms (time, resolution, mouse position, all parameters)
   - Draws full-screen quad with TRIANGLE_STRIP
   - Runs at 60 FPS via requestAnimationFrame

## Development Commands

### Running Locally
```bash
# Serve with any static HTTP server, e.g.:
python3 -m http.server 8000
# Then open http://localhost:8000
```

Or simply open [index.html](index.html) directly in a browser that supports WebGL 2.

### Testing
Open browser console (F12) to check for:
- WebGL compilation errors
- Shader linking errors
- Performance metrics (FPS counter visible in UI)

## Modifying the Simulation

### Adding Visual Effects
Effects are applied in the fragment shader main function (lines 253-346). The rendering pipeline:
1. Calculate metaball values for all blobs
2. Apply smoothstep threshold to create smooth surfaces
3. Mix blob and liquid colors
4. Add glow, lighting, highlights
5. Apply chromatic aberration and vignette
6. Gamma correction and saturation adjustment

### Physics Parameters
Key physics constants in fragment shader:
- `threshold` (line 301): Controls blob shape definition (higher = smaller blobs)
- `smoothness` (line 302): Edge anti-aliasing amount
- Golden ratio `phase` (line 269): Controls blob spacing in circular motion

### Performance Considerations
- Maximum blob count hardcoded to 20 in shader loop (line 265)
- Changing max count requires modifying shader source and recompiling
- Metaball calculation is O(n) per pixel, so performance scales with blobCount × resolution

## WebGL Specifics

### Shader Compilation
- Shaders are compiled at runtime via `compileShader()` (lines 350-362)
- Program linked via `createShaderProgram()` (lines 365-380)
- Check console for GLSL errors if modifications fail to compile

### Uniform Updates
All uniforms updated every frame in `animate()`. When adding new parameters:
1. Add uniform declaration in fragment shader
2. Add to `params` object
3. Get uniform location and update in `animate()`
4. Add UI control in `setupControls()` if user-facing

### Coordinate Systems
- Canvas coordinates: (0,0) bottom-left to (1,1) top-right
- Mouse Y is inverted (line 427) to match OpenGL convention
- Aspect ratio correction applied to UV coordinates (line 256)
