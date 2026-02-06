# AGENTS.md - ISS Earth Sound Application Architecture

## Overview

This document describes the agent-based architecture of the ISS Earth Sound application. The application simulates listening to Earth sounds from the International Space Station (ISS) by tracking the ISS position and playing field recordings from the nearest location on Earth.

## Agent Architecture

The application is organized into several specialized agents, each responsible for a specific domain of functionality:

---

## 1. State Management Agent

**Purpose**: Centralized state management for the entire application.

**Responsibilities**:
- Maintains global application state variables
- Tracks connection status and loading states
- Manages ISS position data
- Stores sound location database
- Tracks current playback state

**State Variables**:
```javascript
- issData: Current ISS position and telemetry data
- soundLocations: Array of all available sound locations from archive.org
- currentSoundLocation: Currently active sound location
- currentTrack: Currently playing audio track metadata
- isLoadingLocations: Boolean flag for sound database loading
- isLoadingISS: Boolean flag for ISS data loading
- connectionStep: Current connection phase (0: Init, 1: Loading, 2: Connected)
- trace: Array of recent ISS positions (last 20 points)
- volume: Audio volume level (0.0 - 1.0)
- isMuted: Mute state
- activePlayer: Which audio player is currently active (1 or 2)
- isPlaying: Whether audio is currently playing
```

**Key Functions**:
- None (passive state storage)

---

## 2. ISS Tracker Agent

**Purpose**: Fetches and updates ISS position data in real-time.

**Responsibilities**:
- Polls the ISS API for current position
- Updates ISS telemetry data (latitude, longitude, altitude, velocity)
- Maintains a trace of recent ISS positions
- Triggers sound location search when position updates

**API Endpoint**:
- `https://api.wheretheiss.at/v1/satellites/25544`

**Key Functions**:
- `fetchISS()`: Fetches current ISS position and updates state
  - Updates `issData` with latest position
  - Adds position to `trace` array (keeps last 20 points)
  - Triggers `findAndPlayNearestSound()` if sound locations are loaded
  - Calls `render()` to update UI

**Update Frequency**: Every 3 seconds (ISS_REFRESH_RATE = 3000ms)

**Data Structure**:
```javascript
issData = {
    latitude: number,
    longitude: number,
    altitude: number,  // km
    velocity: number   // km/h
}
```

---

## 3. Sound Location Agent

**Purpose**: Manages the database of Earth sound locations and finds the nearest sound to the ISS.

**Responsibilities**:
- Fetches sound location data from archive.org
- Parses coordinate data from coverage strings
- Finds the nearest sound location to current ISS position
- Manages sound location metadata

**API Endpoint**:
- `https://archive.org/advancedsearch.php`
- Collection: `radio-aporee-maps`
- Fields: `identifier`, `title`, `creator`, `coverage`

**Key Functions**:
- `fetchSoundLocations()`: Loads sound locations from archive.org
  - Fetches up to 5000 locations (SOUND_BATCH_SIZE)
  - Parses coverage strings to extract coordinates
  - Filters out locations without valid coordinates
  - Updates `soundLocations` array

- `parseCoverage(coverage)`: Extracts coordinates from coverage string
  - Parses latitude, longitude, and location name
  - Returns object with `lat`, `lng`, `name` or `null`

- `findNearestSoundLocation()`: Calculates nearest sound to ISS
  - Uses Haversine formula for distance calculation
  - Returns location object with distance property
  - Returns `null` if no ISS data or no sound locations

- `haversine(lat1, lon1, lat2, lon2)`: Calculates distance between two points
  - Returns distance in kilometers
  - Uses Earth radius of 6371 km

**Data Structure**:
```javascript
soundLocation = {
    identifier: string,      // Archive.org item identifier
    title: string,           // Sound title
    creator: string,         // Artist/creator name
    lat: number,            // Latitude
    lng: number,            // Longitude
    locationName: string,   // Parsed location name
    distance?: number       // Distance from ISS (added when found)
}
```

---

## 4. Audio Playback Agent

**Purpose**: Manages audio playback with smooth crossfading between tracks.

**Responsibilities**:
- Fetches audio URLs from archive.org metadata
- Manages dual audio players for crossfading
- Handles audio playback, volume control, and muting
- Provides smooth transitions when switching sounds

**Key Functions**:
- `getAudioUrl(identifier)`: Fetches MP3 URL from archive.org metadata
  - Queries archive.org metadata API
  - Finds MP3 file (prefers original, falls back to derivative)
  - Returns full download URL

- `findAndPlayNearestSound()`: Orchestrates sound switching
  - Finds nearest sound location
  - Checks if sound has changed (different identifier)
  - Calls `playTrack()` if new sound needed
  - Updates distance if same sound

- `playTrack(track)`: Plays a new audio track
  - Fetches MP3 URL using `getAudioUrl()`
  - Sets up next audio player
  - Initiates crossfade between players
  - Switches active player after crossfade

- `crossfade(fadeOut, fadeIn)`: Smoothly transitions between audio players
  - Fades out current player over 2 seconds
  - Fades in new player simultaneously
  - Uses 20-step animation (100ms per step)
  - Cleans up old player after fade completes

- `setVolume(newVolume)`: Updates audio volume
  - Updates global volume state
  - Applies to current active player
  - Updates volume slider visual

- `toggleMute()`: Toggles mute state
  - Sets volume to 0 when muted
  - Restores volume when unmuted
  - Updates UI to reflect mute state

**Audio Players**:
- Two HTML5 `<audio>` elements for seamless crossfading
- `audioPlayer1` and `audioPlayer2` alternate as active player
- Both set to `loop: true` for continuous playback

**Crossfade Duration**: 2000ms (CROSSFADE_DURATION)

---

## 5. Rendering Agent

**Purpose**: Handles all UI rendering and visual updates.

**Responsibilities**:
- Renders different connection states (Init, Loading, Connected)
- Manages Leaflet interactive map with CRT-styled dark tiles
- Displays sound information panel
- Shows ISS telemetry data
- Uses incremental DOM updates to preserve Leaflet map instance

**Key Functions**:
- `render()`: Main rendering function
  - Determines current connection step
  - On first connected render: builds full layout with Leaflet map container, inits map via `requestAnimationFrame`
  - On subsequent renders: incrementally updates only dynamic slots (sound panel, telemetry, footer, status) to avoid destroying the Leaflet map instance

- `renderMapContainer()`: Returns HTML for Leaflet map container div
  - Creates `.map-container` wrapper with `#leafletMapContainer` inner div

- `renderSoundPanel()`: Renders audio information panel
  - Shows current sound location name and geographic context
  - Displays track title and artist
  - Shows distance to sound location
  - Renders animated sound level indicator
  - Includes volume slider and mute button

- `renderTelemetryPanel()`: Renders ISS telemetry data
  - Displays latitude, longitude, altitude, velocity
  - Shows "SEARCHING SATELLITE..." when no data
  - Formats values with appropriate units (N/S/E/W directions)

**Connection States**:
1. **Step 0 (Init)**: Shows "INITIALIZING TERMINAL..." with pulsing dot
2. **Step 1 (Loading)**: Shows loading messages and progress
3. **Step 2 (Connected)**: Shows full interface with Leaflet map, sound panel, telemetry

---

## 6. Connection Sequence Agent

**Purpose**: Manages the application initialization and connection sequence.

**Responsibilities**:
- Orchestrates startup sequence
- Coordinates data loading
- Handles user interaction for audio autoplay
- Starts periodic ISS updates

**Key Functions**:
- `startConnectionSequence()`: Manages connection flow
  - Step 0: Shows initialization screen
  - Step 1: After 1 second, shows loading screen
  - Loads sound locations and ISS data in parallel
  - Step 2: Shows connected interface when data loaded
  - Starts periodic ISS position updates

- `init()`: Application entry point
  - Initial render
  - Starts connection sequence
  - Sets up click handler for audio autoplay (browser restriction workaround)

**Initialization Flow**:
```
1. Page loads → init() called
2. Render initial screen (Step 0)
3. Wait 1 second
4. Render loading screen (Step 1)
5. Fetch sound locations + ISS data in parallel
6. When both complete → Render connected screen (Step 2)
7. Start periodic ISS updates (every 3 seconds)
```

---

## 7. Leaflet Map Agent

**Purpose**: Manages the interactive Leaflet map with CRT-styled dark tiles.

**Responsibilities**:
- Initializes and configures Leaflet map instance
- Manages custom DivIcon markers for ISS and sound locations
- Draws orbital trace as a polyline
- Auto-follows ISS position with smooth panning
- Applies CRT aesthetic via CSS filters on tile layer

**State Variables**:
```javascript
- leafletMap: Leaflet map instance
- issMarker: L.marker for ISS position (DivIcon with blinking cyan "X" + pulse ring)
- soundMarker: L.marker for sound location (DivIcon with pulsing magenta "S")
- tracePolyline: L.polyline for orbital trace (cyan dashed line)
- mapInitialized: Boolean flag to prevent re-initialization
```

**Key Functions**:
- `createISSIcon()`: Returns a Leaflet DivIcon for the ISS
  - 24x24px cyan square with "X" label
  - Blinking animation (1s step-end)
  - Expanding pulse ring animation (2s ease-out)
  - Cyan box-shadow glow effect

- `createSoundIcon()`: Returns a Leaflet DivIcon for sound locations
  - 20x20px magenta square with "S" label
  - Pulse animation (1.5s)
  - Magenta box-shadow glow effect

- `initLeafletMap()`: Initializes the Leaflet map
  - Creates map in `#leafletMapContainer` with zoom 3, centered at [20, 0]
  - Adds CartoDB Dark Matter tile layer (`basemaps.cartocdn.com/dark_all`)
  - Creates trace polyline (cyan, dashed, weight 2)
  - Creates ISS marker at [0, 0] with high zIndex
  - Disables zoom controls for clean CRT look
  - Enables `worldCopyJump` for seamless wrapping

- `updateLeafletMap()`: Updates map elements on each ISS position refresh
  - Moves ISS marker to new position via `setLatLng()`
  - Updates trace polyline with last 20 positions
  - Smoothly pans map to follow ISS (`setView` with animate)
  - Creates or updates sound marker position

**Tile Layer Configuration**:
- Provider: CartoDB Dark Matter (`dark_all`)
- Subdomains: a, b, c, d
- CSS filter: `brightness(2) contrast(1.1) sepia(0.5) hue-rotate(140deg) saturate(2.5)` for cyan CRT tint

**Responsive Behavior**:
- Desktop: 400px height
- Tablet (768px): 280px height
- Mobile (480px): 200px height, smaller marker icons (18px ISS, 16px sound)

---

## Agent Interactions

### Data Flow

```
1. Connection Sequence Agent
   ↓
2. Sound Location Agent (loads database)
   ↓
3. ISS Tracker Agent (starts polling)
   ↓
4. Sound Location Agent (finds nearest)
   ↓
5. Audio Playback Agent (plays sound)
   ↓
6. Rendering Agent (updates UI)
```

### Event Loop

```
Every 3 seconds:
  ISS Tracker Agent → fetchISS()
    ↓
  Sound Location Agent → findNearestSoundLocation()
    ↓
  Audio Playback Agent → findAndPlayNearestSound()
    ↓ (if sound changed)
  Audio Playback Agent → playTrack()
    ↓
  Rendering Agent → render() (incremental DOM updates)
    ↓
  Leaflet Map Agent → updateLeafletMap() (marker/trace updates)
```

---

## Constants

```javascript
ISS_REFRESH_RATE = 3000       // ISS update interval (ms)
CROSSFADE_DURATION = 2000     // Audio crossfade duration (ms)
SOUND_BATCH_SIZE = 5000       // Max sound locations to load
```

---

## External Dependencies

### Libraries
- **Leaflet 1.9.4**: Interactive map library (loaded via unpkg CDN)
  - CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

### APIs
- **ISS Tracker API**: `api.wheretheiss.at` - Real-time ISS position
- **Archive.org API**: `archive.org` - Sound location database and audio files
- **CartoDB Tile Server**: `basemaps.cartocdn.com/dark_all` - Dark Matter map tiles
- **BigDataCloud Geocoding**: `api.bigdatacloud.net` - Reverse geocoding for location context

### Browser APIs
- **Fetch API**: For HTTP requests
- **HTML5 Audio API**: For audio playback
- **DOM API**: For UI manipulation

---

## Design Patterns

1. **Agent Pattern**: Each domain is handled by a dedicated agent
2. **State Management**: Centralized state with reactive rendering
3. **Incremental DOM Updates**: Rendering Agent updates only dynamic slots to preserve Leaflet map instance
4. **Dual Buffer Pattern**: Two audio players for seamless crossfading
5. **Polling Pattern**: Periodic ISS position updates
6. **DivIcon Pattern**: Custom Leaflet markers using HTML/CSS for CRT-styled icons

---

## Changelog

### v2.0 - Leaflet Map Migration (2026-02-06)

**Replaced ASCII pixel map with interactive Leaflet map** while preserving the CRT/Minitel retro aesthetic.

#### What Changed
- **Map rendering**: Removed 80x24 Unicode block character grid (`WORLD_MAP_ASCII`, `renderGrid()`, `renderVideotexChar()`, `getGridPosition()`) and replaced with Leaflet.js interactive map using CartoDB Dark Matter tiles
- **CRT filter on tiles**: CSS filter chain (`brightness + contrast + sepia + hue-rotate + saturate`) applies a cyan CRT tint to the dark map tiles
- **ISS marker**: Custom `L.divIcon` with blinking cyan "X" and expanding pulse ring animation (replaces `.videotex-iss` grid cell)
- **Sound marker**: Custom `L.divIcon` with pulsing magenta "S" (replaces `.videotex-sound` grid cell)
- **Orbital trace**: Cyan dashed `L.polyline` connecting last 20 ISS positions (replaces `.videotex-trace` dots)
- **Auto-follow**: Map smoothly pans to center on ISS every 3 seconds
- **Incremental rendering**: `render()` refactored to build layout once, then update only dynamic slots (`#soundPanelSlot`, `#telemetrySlot`, `#footerSounds`, `#footerStatus`, `#statusDot`) to avoid destroying Leaflet map on re-renders
- **Responsive map heights**: 400px (desktop), 280px (768px), 200px (480px) with smaller marker sizes on mobile

#### What Stayed the Same
- CRT overlay effects (scanlines, vignette, static noise, flicker) still layer over map
- Signal quality system still adjusts CRT effects based on distance
- Sound panel, telemetry panel, header, footer: unchanged
- Audio playback with crossfade: unchanged
- Connection sequence (Init → Loading → Connected): unchanged
- All API integrations: unchanged

#### Removed Code
- `GRID_W`, `GRID_H` constants
- `WORLD_MAP_ASCII` 80x24 character array
- `getGridPosition(lat, lon)` coordinate mapping function
- `renderVideotexChar()` cell renderer
- `renderGrid()` ASCII map builder
- All `.map-row`, `.map-cell`, `.videotex-*` CSS classes

#### Added Dependencies
- Leaflet 1.9.4 (CSS + JS via unpkg CDN)
- CartoDB Dark Matter tile server

---

## Future Enhancements

Potential improvements for each agent:

1. **State Management Agent**: Add state persistence, undo/redo
2. **ISS Tracker Agent**: WebSocket for real-time updates, error recovery
3. **Sound Location Agent**: Caching, incremental loading, search filtering
4. **Audio Playback Agent**: Preloading, buffering, equalizer
5. **Rendering Agent**: Themes, additional CRT filter presets
6. **Connection Sequence Agent**: Retry logic, offline mode
7. **Leaflet Map Agent**: Zoom level linked to ISS altitude, click-to-play sounds, tile provider options
