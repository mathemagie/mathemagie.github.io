# Audio Visualizer

A real-time audio visualizer that transforms music into stunning ASCII art animations. Experience your audio through 9 unique visualization styles, each responding dynamically to different frequency bands.

## 🎵 Features

- **9 Unique Animation Styles**: Choose from hybrid layered patterns, matrix streams, ripples, spirals, spectrum bars, starfields, waveforms, kaleidoscopes, and particle explosions
- **Smooth Animation Blending**: Seamless 1-second transitions when switching between animation styles
- **Custom Color Themes**: 4 built-in themes (Default, Dark, Neon, Warm) with theme selector
- **Mobile Touch Gestures**: Swipe navigation, tap controls, and long-press menus for mobile devices
- **Web Workers**: Offloads grid calculations to background threads for better performance
- **WebGL GPU Acceleration**: Hardware-accelerated rendering for particle systems (1000+ particles at 60 FPS)
- **Real-time Audio Analysis**: Uses Web Audio API to analyze bass, mid, and treble frequencies
- **Fullscreen Mode**: Immersive viewing experience with automatic fullscreen support
- **Screenshot Capture**: Save your favorite visualizations as PNG images (includes WebGL rendering)
- **Auto-load Audio**: Automatically detects and loads MP3 files in the directory
- **Responsive Design**: Adapts to any screen size with dynamic grid calculation
- **Keyboard Shortcuts**: Quick controls for common actions
- **Smooth Animations**: 60 FPS animations using `requestAnimationFrame`

## 🚀 Quick Start

1. **Open the Visualizer**
   - Simply open `index.html` in a modern web browser
   - The visualizer will automatically attempt to load MP3 files from the current directory

2. **Load Audio**
   - Click "Choisir un fichier MP3" to select an audio file
   - Or place an MP3 file in the same directory (it will auto-load)
   - Supported formats: MP3, WAV, OGG (via browser support)

3. **Choose Animation Style**
   - Use the dropdown menu to select from 9 different visualization styles
   - Switch styles anytime during playback (smooth blending transitions)
   - On mobile: Swipe left/right to change styles

4. **Customize Theme**
   - Select a theme from the dropdown (Default, Dark, Neon, Warm)
   - Theme preference is saved automatically

5. **Enjoy the Show**
   - Controls automatically hide during playback for an immersive experience
   - Move your mouse or press 'C' to show controls again
   - On mobile: Swipe down to toggle controls, tap to play/pause

## 🎨 Animation Styles

### 1. Hybrid Layered
**Default style** - Complex radial patterns with concentric rings, swirling segments, and spiral effects. Combines multiple visualization techniques for a rich, layered experience.

- **Bass**: Controls pulsing rings and spiral intensity
- **Mid**: Affects radial wave patterns
- **Treble**: Adds fine detail and sparkles

### 2. Matrix Streams
Inspired by "The Matrix" - Vertical falling streams of characters that respond to frequency bands. Each column represents a different frequency range.

- **Frequency Bands**: Each column maps to a specific frequency range
- **Stream Speed**: Controlled by overall volume
- **Character Density**: Varies with frequency intensity

### 3. Ripple Waves
Expanding circular ripples from multiple moving sources. Creates a water-like effect that pulses with the music.

- **Bass**: Controls number of ripple sources and expanding circles
- **Overall**: Affects ripple intensity and visibility
- **Peak Frequency**: Highlights dominant frequencies

### 4. Spiral Vortex
Rotating spiral patterns that create a vortex effect. Multiple spiral arms respond to different frequency ranges.

- **Bass**: Controls primary spiral arm
- **Mid**: Affects secondary spiral patterns
- **Treble**: Adds fine spiral details
- **Overall**: Controls rotation speed

### 5. Spectrum Bars
Horizontal frequency bars showing the audio spectrum. Classic equalizer-style visualization with peak indicators.

- **Frequency Bands**: Each bar represents a frequency range
- **Bar Height**: Proportional to frequency amplitude
- **Peak Indicators**: Shows frequencies above 80% intensity

### 6. Starfield
Moving stars and particles that create a 3D starfield effect. Particles move toward the viewer, creating depth. **Uses WebGL GPU acceleration** for enhanced performance (1000+ particles).

- **Overall Volume**: Controls particle speed and density
- **Bass**: Triggers new particle bursts
- **Particle Trails**: Audio-reactive sparkles
- **WebGL Mode**: Automatically enabled if supported, falls back to ASCII rendering

### 7. Waveform
Oscilloscope-style waveform visualization. Shows the audio signal as a continuous wave across the screen.

- **Frequency Bands**: Multiple waveforms for different ranges
- **Time Modulation**: Wave patterns shift over time
- **Center Line**: Reference line for waveform display

### 8. Kaleidoscope
Symmetric, mirrored patterns that create kaleidoscope effects. Multiple segments rotate and reflect to create mesmerizing patterns.

- **Bass**: Controls number of segments (8-12)
- **Mid**: Affects angular patterns
- **Treble**: Adds radial details
- **Symmetry**: Creates mirrored patterns across segments

### 9. Particle Explosion
Exploding particles from the center that respond to bass hits. Particles are attracted back to the center, creating dynamic explosions. **Uses WebGL GPU acceleration** for enhanced performance (500+ particles).

- **Bass**: Triggers new particle explosions
- **Mid**: Controls particle attraction/gravity
- **Particle Life**: Particles fade over time
- **Trails**: Audio-reactive background particles
- **WebGL Mode**: Automatically enabled if supported, falls back to ASCII rendering

## ⌨️ Keyboard Shortcuts

- **`C`** - Toggle controls visibility
- **`F`** or **`F11`** - Toggle fullscreen mode
- **`Escape`** - Exit fullscreen mode

## 📱 Mobile Touch Gestures

- **Swipe Left/Right** - Change animation style (with visual feedback)
- **Swipe Up** - Toggle fullscreen mode
- **Swipe Down** - Show/hide controls
- **Tap** - Toggle play/pause
- **Long Press** - Show/hide controls menu

## 🎛️ Controls

### Playback Controls
- **Choisir un fichier MP3**: Select an audio file to load
- **Play**: Start audio playback
- **Stop**: Stop audio playback (looping is disabled when manually stopped)

### Display Controls
- **Fullscreen**: Enter/exit fullscreen mode
- **Screenshot**: Capture current visualization as PNG (includes WebGL rendering)
- **Animation Style**: Dropdown to select visualization style (with smooth blending transitions)
- **Theme**: Dropdown to select color theme (Default, Dark, Neon, Warm)

### Auto-hide Behavior
- Controls automatically hide 5 seconds after playback starts
- Move mouse to temporarily show controls
- Controls auto-hide again after 3 seconds of no mouse movement
- Press 'C' to permanently toggle controls

## 🔧 Technical Details

### Audio Analysis
- **FFT Size**: 256 (128 frequency bins)
- **Frequency Bands**:
  - Bass: 0-15% of frequency range
  - Mid: 15-50% of frequency range
  - Treble: 50-100% of frequency range
- **Update Rate**: ~60 FPS (via `requestAnimationFrame`)

### Grid System
- **Dynamic Sizing**: Grid dimensions calculated based on viewport size
- **Character Aspect Ratio**: 0.6 (monospace fonts are wider than tall)
- **Font Scaling**: Automatically adjusts to fill screen perfectly
- **Responsive**: Recalculates on window resize (throttled to 100ms)

### Performance Optimizations
- **Web Workers**: Grid calculations offloaded to background threads for better frame rate stability
- **WebGL GPU Acceleration**: Hardware-accelerated rendering for particle systems (Starfield, Particle Explosion)
- **Cached Values**: Frequently calculated values (center points, distances) are cached
- **Optimized Rendering**: Uses `array.join()` instead of string concatenation for faster text rendering
- **Distance Calculations**: Uses squared distance comparisons to avoid expensive `Math.sqrt()` calls

### Browser Compatibility
- **Chrome/Edge**: Full support (Web Workers, WebGL, Themes, Touch Gestures)
- **Firefox**: Full support (Web Workers, WebGL, Themes, Touch Gestures)
- **Safari**: Full support (may require user interaction for audio, WebGL supported)
- **Mobile Browsers**: Full support with touch gesture controls
- **Web Workers**: All modern browsers (IE10+)
- **WebGL**: Chrome 9+, Firefox 4+, Safari 5.1+, Edge (falls back to ASCII if unavailable)
- **CSS Custom Properties**: All modern browsers (IE11+)

### File Loading
The visualizer attempts to auto-load MP3 files in this order:
1. File specified in URL parameter: `?file=audio.mp3`
2. `ElevenLabs_2025-11-10T15_48_49_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3`
3. `audio.mp3`
4. `music.mp3`
5. `song.mp3`
6. `sound.mp3`

## 📁 Project Structure

```
audio_visualiser/
├── index.html          # Main application file (single-page app)
├── worker.js           # Web Worker for offloading grid calculations
├── webgl-renderer.js   # WebGL renderer for GPU-accelerated particle systems
├── shaders/
│   ├── particle.vert  # Vertex shader for particle rendering
│   └── particle.frag  # Fragment shader for particle rendering
├── README.md           # This documentation
└── *.mp3               # Audio files (auto-detected)
```

## 🎯 Usage Examples

### Basic Usage
1. Open `index.html` in a web browser
2. Select an audio file or let it auto-load
3. Choose your preferred animation style
4. Enjoy the visualization!

### URL Parameters
Load a specific audio file via URL:
```
index.html?file=path/to/your/audio.mp3
```

### Screenshot
1. Start playback
2. Wait for the perfect moment
3. Click "Screenshot" button
4. Image downloads automatically as PNG

## 🐛 Troubleshooting

### Audio Not Playing
- **Browser Permissions**: Some browsers require user interaction before playing audio
- **File Format**: Ensure your audio file is in a supported format (MP3 recommended)
- **File Path**: Check that the audio file path is correct

### Controls Not Visible
- Press **`C`** to toggle controls
- Move your mouse to show controls temporarily
- Controls auto-hide during playback for immersion

### Fullscreen Not Working
- Some browsers require user interaction before entering fullscreen
- Try clicking anywhere on the page first
- Use **`F11`** as an alternative

### Performance Issues
- Close other browser tabs
- Reduce browser zoom level
- Use a smaller viewport size
- Some animations (Starfield, Particles) are more CPU-intensive

## 🎨 Customization

### Changing Themes
The visualizer includes 4 built-in themes accessible via the theme selector:
- **Default**: Light beige background with dark text
- **Dark**: Dark background with light text
- **Neon**: Black background with cyan text
- **Warm**: Dark brown background with orange text

Theme preference is automatically saved to localStorage and restored on page load.

### Custom Color Schemes
To add custom themes, edit the `themes` object in `index.html`:
```javascript
var themes = {
    'your-theme': {
        bg: '#your-bg-color',
        text: '#your-text-color',
        controlBg: 'rgba(...)',
        border: '#your-border-color',
        buttonBg: '#your-button-bg',
        buttonDisabledBg: '#your-disabled-bg',
        textShadow: 'rgba(...)'
    }
};
```

Then add an option to the theme selector dropdown.

### Adjusting Animation Speed
Modify `TIME_INCREMENT` in the `CONFIG` object:
```javascript
TIME_INCREMENT: 0.1, // Increase for faster animations, decrease for slower
```

### Animation Blending Duration
Adjust the blending transition duration:
```javascript
blending.duration = 1000; // Duration in milliseconds (default: 1000ms)
```

### Changing Grid Density
Modify `estimatedCharHeight` in `calculateGridSize()`:
```javascript
var estimatedCharHeight = 10; // Smaller = more characters, larger = fewer
```

## 📝 Code Structure

The application is a single-file HTML application with:
- **HTML**: Structure and controls
- **CSS**: Styling and layout
- **JavaScript**: Audio processing and visualization logic

### Key Functions
- `calculateGridSize()`: Calculates optimal grid dimensions
- `getAudioData()`: Extracts and normalizes audio frequency data
- `animate[Style]()`: Individual animation style functions
- `playAudio()`: Handles audio playback and looping
- `render()`: Converts grid to text and displays (handles WebGL overlay)
- `interpolateChar()`: Blends characters for smooth animation transitions
- `applyTheme()`: Applies color theme to the application
- `WebGLRenderer`: GPU-accelerated particle rendering system

### Architecture Components
- **Main Thread**: UI, audio playback, rendering coordination
- **Web Worker**: Background grid calculations (when available)
- **WebGL Renderer**: GPU-accelerated particle systems (Starfield, Particles)
- **Animation Registry**: Object map for animation style routing
- **Theme System**: CSS custom properties with JavaScript theme switching

## 🔮 Future Enhancements

Potential improvements:
- [x] Custom color schemes (themes)
- [ ] Animation speed controls (UI slider)
- [ ] Multiple audio sources (microphone input)
- [ ] Export animations as video
- [ ] Preset configurations
- [x] Animation blending/transitions
- [ ] Custom character sets
- [ ] WebGL for all animations (not just particles)
- [ ] Custom theme editor
- [ ] Gesture customization
- [ ] Performance metrics display
- [ ] Animation presets/saved configurations

## 📄 License

This project is part of the mathemagie.github.io collection.

## 🙏 Acknowledgments

- Web Audio API for real-time audio analysis
- ASCII art community for inspiration
- All the music that makes this visualizer come alive!

---

**Enjoy your audio visualizations!** 🎵✨

