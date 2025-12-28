# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Three.js WebGPU visualization showcasing Earth with a realistic ISS satellite orbiting around it. The project demonstrates Three.js Shading Language (TSL) capabilities for creating custom shader materials using a node-based system.

**Critical Architecture**: This is a single-file HTML application (`index.html`) with no build process. All JavaScript is embedded inline as an ES module.

## How to Run

Open `index.html` directly in a web browser that supports WebGPU (Chrome/Edge 113+, or browsers with WebGPU flag enabled). No build step or local server required.

## External Dependencies (CDN-based)

- **Three.js v0.181.0** (WebGPU build) - Core 3D library loaded via importmap
- **Three.js TSL** (v0.181.0) - Shading language module for node-based materials
- **OrbitControls** - Camera control addon from Three.js examples

The importmap at lines 19-28 defines all module imports. Keep version consistency across all three.js imports.

## Key Technical Components

### Rendering Architecture
- **WebGPURenderer** (line 50): Requires async initialization via `renderer.init()` before rendering
- Uses Three.js node materials (`MeshStandardNodeMaterial`, `SpriteNodeMaterial`, etc.) instead of traditional materials
- All shader logic is expressed via TSL node functions (`Fn()`) rather than GLSL strings

### Earth Material System (lines 103-141)
The Earth uses a sophisticated multi-texture material system:
- **Day texture**: Base earth surface (albedo map)
- **Night lights**: City lights visible on dark side, controlled by sun direction and Fresnel
- **Specular map**: Controls ocean reflectivity - water areas have lower roughness (0.3 vs 0.9)
- **Fresnel atmosphere**: Blue atmospheric glow computed in `emissiveNode` using view angle

Key functions:
- `earthMaterial.roughnessNode` (line 116): Ocean specularity via `mix()` based on specular map
- `earthMaterial.emissiveNode` (line 123): Combines atmosphere glow and night lights using TSL nodes

### Cloud Layer (lines 143-156)
Separate transparent sphere (radius 2.01 vs Earth 2.0) with alpha-based opacity from cloud texture.

### ISS Satellite (lines 158-175)
- Uses `Sprite` to always face camera
- TSL-based pulsing glow effect via `sin(time)` node (lines 168-171)
- Orbital mechanics at lines 177-222 with tilt parameter

### TSL Node System
When working with materials, use TSL imports (line 34-38):
- `Fn()` wraps shader logic
- Node functions: `vec3()`, `vec4()`, `float()`, `mix()`, `dot()`, `normalize()`, `pow()`, etc.
- Special nodes: `time`, `normalWorld`, `positionWorld`, `cameraPosition`, `texture()`, `uv()`

Example pattern (line 116):
```javascript
earthMaterial.roughnessNode = Fn(() => {
  const spec = earthSpecMap.r;
  return mix(float(0.9), float(0.3), spec);
})();
```

## Satellite Orbit Mathematics

The ISS orbit is defined by:
- `orbitRadius = 4.5` (line 178)
- `orbitSpeed = 0.5` (line 179)
- `orbitTilt = 0.3` radians (line 180)

Position calculation (lines 219-222):
```javascript
x = cos(angle) * radius
y = sin(angle) * radius * sin(tilt)
z = sin(angle) * radius * cos(tilt)
```

## Texture Sources

All textures loaded from Three.js GitHub examples:
- Earth day/night/specular/clouds from `examples/textures/planets/`
- ISS sprite from `examples/textures/sprite0.png`

URLs are hardcoded at lines 97-100, 159.

## Performance Considerations

- Earth and clouds use high polygon counts (128/64 segments) for smoothness
- Stars use `PointsNodeMaterial` with 5000 particles for performance
- Animation loop runs at browser refresh rate (requestAnimationFrame)

## Implementation Guidelines

**Do:**
- Keep the single-file architecture - no build process or module splitting
- Use TSL node functions (`Fn()`, `vec3()`, etc.) for all shader logic
- Maintain async/await pattern for WebGPU initialization
- Use `texture()` node wrapper for texture sampling in TSL
- Keep Three.js version consistent across all CDN imports

**Don't:**
- Mix traditional GLSL strings with TSL nodes
- Add bundlers, package.json, or build steps
- Change material types away from `*NodeMaterial` classes
- Remove the `renderer.init()` async call - WebGPU requires it
- Hardcode credentials or add server-side components

## Common Modifications

**Adding new effects to Earth:**
Edit the `earthMaterial.emissiveNode` Fn() at line 123 or create new node properties.

**Changing satellite behavior:**
Modify orbit parameters (lines 178-180) or position calculation (lines 219-222).

**Adjusting atmosphere:**
The Fresnel calculation is at line 127: `pow(float(1.0).sub(NdotV), 3.0)`

**Performance tuning:**
Reduce geometry segments (line 103: `SphereGeometry(2, 128, 128)`) or star count (line 69).
