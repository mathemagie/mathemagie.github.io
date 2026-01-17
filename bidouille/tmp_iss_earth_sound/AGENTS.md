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
- Draws ASCII world map with ISS position
- Displays sound information panel
- Shows ISS telemetry data
- Updates UI elements based on state

**Key Functions**:
- `render()`: Main rendering function
  - Determines current connection step
  - Renders appropriate screen based on state
  - Updates entire screen content

- `renderGrid()`: Renders ASCII world map
  - Converts ISS and sound locations to grid coordinates
  - Draws world map using ASCII characters
  - Marks ISS position with blinking 'X'
  - Marks current sound location with pulsing 'S'
  - Draws trace of recent ISS positions
  - Uses different styles for land, water, ISS, sound, and trace

- `renderVideotexChar(char, isIss, isTrace, isSoundLoc)`: Renders individual map cell
  - Returns HTML for different cell types
  - ISS: Blinking cyan background with 'X'
  - Sound location: Pulsing magenta background with 'S'
  - Land: White block character (█)
  - Trace: Small cyan dots
  - Water: Cyan dots

- `renderSoundPanel()`: Renders audio information panel
  - Shows current sound location name
  - Displays track title and artist
  - Shows distance to sound location
  - Renders animated sound level indicator
  - Includes volume slider and mute button

- `renderTelemetryPanel()`: Renders ISS telemetry data
  - Displays latitude, longitude, altitude, velocity
  - Shows "SEARCHING SATELLITE..." when no data
  - Formats values with appropriate units

- `getGridPosition(lat, lon)`: Converts coordinates to grid position
  - Maps latitude/longitude to 80x24 grid
  - Uses standard map projection (Mercator-like)

**Connection States**:
1. **Step 0 (Init)**: Shows "INITIALIZING TERMINAL..." with pulsing dot
2. **Step 1 (Loading)**: Shows loading messages and progress
3. **Step 2 (Connected)**: Shows full interface with map, sound panel, telemetry

**Grid Dimensions**: 80 columns × 24 rows (GRID_W × GRID_H)

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

## 7. Coordinate Mapping Agent

**Purpose**: Handles coordinate transformations between geographic and grid space.

**Responsibilities**:
- Converts latitude/longitude to grid coordinates
- Maps real-world positions to ASCII map display

**Key Functions**:
- `getGridPosition(lat, lon)`: Converts geographic coordinates to grid
  - Maps longitude [-180, 180] to x [0, GRID_W-1]
  - Maps latitude [90, -90] to y [0, GRID_H-1]
  - Uses simple linear projection

**Grid Mapping**:
- X-axis: Longitude -180° (left) to +180° (right)
- Y-axis: Latitude +90° (top) to -90° (bottom)

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
  Rendering Agent → render()
```

---

## Constants

```javascript
GRID_W = 80                    // Map width in characters
GRID_H = 24                    // Map height in characters
ISS_REFRESH_RATE = 3000       // ISS update interval (ms)
CROSSFADE_DURATION = 2000     // Audio crossfade duration (ms)
SOUND_BATCH_SIZE = 5000       // Max sound locations to load
```

---

## External Dependencies

### APIs
- **ISS Tracker API**: `api.wheretheiss.at` - Real-time ISS position
- **Archive.org API**: `archive.org` - Sound location database and audio files

### Browser APIs
- **Fetch API**: For HTTP requests
- **HTML5 Audio API**: For audio playback
- **DOM API**: For UI manipulation

---

## Design Patterns

1. **Agent Pattern**: Each domain is handled by a dedicated agent
2. **State Management**: Centralized state with reactive rendering
3. **Observer Pattern**: Rendering updates when state changes
4. **Dual Buffer Pattern**: Two audio players for seamless crossfading
5. **Polling Pattern**: Periodic ISS position updates

---

## Future Enhancements

Potential improvements for each agent:

1. **State Management Agent**: Add state persistence, undo/redo
2. **ISS Tracker Agent**: WebSocket for real-time updates, error recovery
3. **Sound Location Agent**: Caching, incremental loading, search filtering
4. **Audio Playback Agent**: Preloading, buffering, equalizer
5. **Rendering Agent**: Canvas rendering, animations, themes
6. **Connection Sequence Agent**: Retry logic, offline mode
7. **Coordinate Mapping Agent**: Better map projections, zoom levels
