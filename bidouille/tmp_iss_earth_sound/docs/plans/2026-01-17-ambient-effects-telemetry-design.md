# ISS Earth Sound: Ambient Effects & Information Display Enhancement

## Overview

Enhance the ISS Earth Sound app with three cohesive features:
1. Distance-based CRT effects (signal quality visualization)
2. Geographic context for sound sources
3. Improved telemetry readability

## Design Approach: Subtle Integration

Fits the existing Minitel aesthetic without overwhelming it. Enhances rather than reinvents.

---

## Feature 1: Distance-Based CRT Effects

### How it works

When the ISS position updates, calculate the distance to the nearest sound source. This distance maps to a "signal quality" value from 0 (far/weak) to 1 (close/strong).

### Distance thresholds

| Distance | Signal Quality | Description |
|----------|----------------|-------------|
| < 500 km | 1.0 | Perfect signal |
| 500–2000 km | 0.7–1.0 | Good signal, minimal degradation |
| 2000–5000 km | 0.3–0.7 | Fair signal, noticeable effects |
| > 5000 km | 0.0–0.3 | Weak signal, maximum effects |

### Visual changes based on signal quality

1. **Scan line opacity** — Increases from 0.02 to 0.08 as signal weakens
2. **Static noise overlay** — Subtle grain texture, opacity 0 at perfect signal, up to 0.05 at weak
3. **Phosphor glow** — Green text glow reduces slightly at weak signals
4. **Color temperature** — Slight shift toward cooler/bluer tones at weak signal (very subtle)

### Implementation

- Add `signalQuality` state variable (0.0–1.0)
- Create CSS custom properties (`--signal-quality`, `--static-opacity`, etc.)
- Update via JavaScript when distance changes
- CSS handles visual transitions smoothly

No glitch animations — continuous, gentle shifts only.

---

## Feature 2: Geographic Context for Sounds

### Data source

BigDataCloud reverse geocoding API (free, no API key):
```
https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lng}
```

### Information to display

1. **Country** — Always shown
2. **Region/State** — When available
3. **Nearest city** — When available
4. **Local time** — Calculated from timezone

### Display format

Below the current sound title, secondary line in smaller/dimmer text:

```
♪ Field recording - Morning birds at the harbor
  France · Provence · near Marseille · 14:32 local
```

### Caching

Store geocoded results in a Map keyed by coordinates (rounded to 2 decimals).

### Fallback

If geocoding fails, show coordinates: "45.2°N, 5.4°E"

---

## Feature 3: Improved Telemetry Readability

### Typography improvements

1. **Increase font size** — Telemetry values to ~1.4rem
2. **Value hierarchy** — Numbers larger/brighter than labels
3. **Monospace alignment** — Use `tabular-nums` for proper alignment
4. **Dimmer labels** — Labels at 60% opacity, values at 100%

### Layout

```
┌─────────────────────────────────────┐
│  ALT        VEL        LAT     LNG  │
│  423 km    27,540     45.2°N  12.3°E│
│            km/h                      │
└─────────────────────────────────────┘
```

### Formatting

- Altitude: Round to whole km, add "km" unit
- Velocity: Format with thousands separator, add "km/h"
- Coordinates: One decimal place, with N/S/E/W suffix

---

## Integration

### State additions

```javascript
signalQuality: 1.0,        // 0.0 (weak) to 1.0 (strong)
currentLocationInfo: null, // { country, region, city, timezone, localTime }
geocodeCache: new Map()    // coordinates → location info
```

### CSS custom properties

```css
--signal-quality: 1;
--static-opacity: 0;
--scanline-opacity: 0.02;
--glow-intensity: 1;
```

### Performance

- Geocoding only when sound source changes
- CSS transitions for smooth visual changes
- Cache geocoded results

### Files to modify

- `index.html` — All changes (CSS + JS + markup)
