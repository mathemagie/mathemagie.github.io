# 3615 TERRE — Ecoute Aveugle

## Concept

Remove the map entirely. The user connects to a Minitel terminal that plays geolocated field recordings from below the ISS. They listen blindly for 60 seconds, then the location is revealed via a teletype decoding effect. The user controls the pacing between rounds.

## State Machine

```
INIT ──> ECOUTE ──> DECODAGE ──> ATTENTE ──┐
              ^                              │
              └──────────────────────────────┘
```

### INIT (on page load)
- Fetch ISS position
- Fetch sound locations from archive.org
- Show "CONNEXION 3615 TERRE..." loading sequence
- Auto-transition to ECOUTE once ready

### ECOUTE (60 seconds)
- Poll ISS position every 5s
- Find nearest sound, play with crossfade
- Display countdown from 60, large and centered
- Sound bars animate as visual centerpiece
- At 30s mark: reveal partial metadata hints (signal strength + one redacted coordinate)
- CRT effects react to signal quality
- Timer hits 0 → transition to DECODAGE

### DECODAGE (~5-8 seconds)
- Sound continues playing (no interruption)
- Screen clears
- Teletype effect types location info line by line:
  - ~50ms per character
  - ~300ms pause between lines
- Content:
  ```
  DECODAGE EN COURS...
  =====================
  POSITION ISS: 48.21°N  11.78°E
  ALTITUDE: 408 KM
  VITESSE: 27,580 KM/H

  SON CAPTE A PROXIMITE DE:
  > Munich, Baviere
  > Allemagne
  > 14:32 HEURE LOCALE

  DISTANCE SIGNAL: 312 KM
  QUALITE: ████████░░ 82%

  [CONNEXION] POUR CONTINUER
  ```
- When typing completes → transition to ATTENTE

### ATTENTE (indefinite)
- Reveal text stays on screen
- Sound continues
- `[CONNEXION]` prompt blinks
- Click anywhere or press any key → back to ECOUTE
- Orbit counter increments

## Screen Layout

### During ECOUTE

```
┌─────────────────────────────────────┐
│ 3615 TERRE        ● CONNECTE  22:14│
├─────────────────────────────────────┤
│          COMPOSEZ LA TERRE          │
├─────────────────────────────────────┤
│                                     │
│                                     │
│            ▌▌▌▌▌▌▌▌▌▌              │
│             ECOUTE...               │
│                                     │
│              00:34                  │
│                                     │
│                                     │
│                                     │
│                                     │
│  SIGNAL: 0.82    LATITUDE: ██.█°N  │
│                                     │
├─────────────────────────────────────┤
│  VOL [████████░░]  SOURDINE  [ ]   │
├─────────────────────────────────────┤
│  ORBITE #3        1247 sons charges │
└─────────────────────────────────────┘
```

Key elements:
- No map — sound bars become visual centerpiece (enlarged)
- Large centered countdown timer
- Orbit counter in footer
- Partial metadata hints at 30s mark (redacted coords)
- Audio controls preserved (volume + mute)
- CRT overlay effects remain (scanlines, vignette, flicker, static)

## What Gets Removed

- Leaflet map, tiles, markers (ISS + sound)
- All `.map-container` CSS
- `initLeafletMap()`, `updateMapPosition()`, `createISSIcon()`, `createSoundIcon()`
- Leaflet CSS/JS dynamic loading
- Telemetry grid (data moves into DECODAGE reveal)
- Fullscreen button

## What Gets Kept

- WebAudio pipeline (crossfade, gain nodes, low-pass filter, white noise)
- Signal quality calculation + CRT effects
- Archive.org fetching + sound location matching
- Audio unlock prompt
- Volume slider + mute
- Haversine distance + nearest sound search
- ISS position polling

## New Code

- State machine (ECOUTE / DECODAGE / ATTENTE)
- Countdown timer (setInterval + display)
- Teletype effect function (char by char into DOM)
- Partial metadata hint logic (reveal at 30s)
- Orbit counter (session variable)
- Keyboard/click listener for ATTENTE → ECOUTE transition
