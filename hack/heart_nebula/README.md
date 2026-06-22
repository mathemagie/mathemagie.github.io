# Heart Nebula

A mesmerizing animated visualization of the Heart Nebula (IC 1805) featuring a pulsating nebula with customizable visual effects. Experience the cosmic beauty with smooth breathing animations, dynamic color shifts, and interactive controls for fine-tuning the visual experience.

![Heart Nebula Demo](https://github.com/user-attachments/assets/341283af-06d8-47ff-a7f7-efe9fc10b1a1)

## Features

### 🌌 Animated Nebula Visualization
- **Realistic Heart Nebula image** (IC 1805) as the base texture
- **Smooth pulsing animation** with natural breathing pattern using sine wave interpolation
- **Ultra-smooth transitions** with cubic-bezier easing curves
- **Full-screen immersive experience** with mobile-optimized display

### 🎨 Dynamic Visual Effects
- **Brightness control**: Adjust the intensity of the nebula glow (0.8x - 1.8x)
- **Color saturation**: Fine-tune the vibrancy of nebula colors (1.0x - 1.6x)
- **Hue shifting**: Cycle through different color variations (0° - 20°)
- **Size pulsing**: Control the subtle scale animation (1.000x - 1.050x)
- **Speed adjustment**: Customize animation timing (2s - 12s cycles)

### 🛠️ Interactive Controls (Debug Mode)
![Debug Controls](https://github.com/user-attachments/assets/9fc6dd5b-3a78-4d37-b2aa-31ea708f7f7d)

- **Real-time parameter adjustment** with smooth visual feedback
- **Collapsible control panel** with elegant glassmorphism design
- **Live value display** for all parameters
- **Smooth control transitions** with backdrop blur effects

### 📱 Mobile & PWA Ready
- **iOS Web App support** with custom icons and startup screens
- **Full-screen mobile experience** with viewport optimization
- **Touch-friendly controls** and responsive design
- **PWA manifest** for app-like installation

## Quick Start

1. **Open `index.html`** in any modern web browser
2. **Enjoy the pulsing nebula** animation in full-screen beauty
3. **Add `?debug=1`** to the URL to access interactive controls:
   ```
   file:///path/to/index.html?debug=1
   ```
4. **Press the fullscreen button** (⛶) for immersive viewing
5. **Adjust controls** in debug mode to customize the experience

## Controls & Features

### Debug Mode Controls
Access by adding `?debug=1` to the URL:

- **Speed**: Control animation cycle duration (2-12 seconds)
- **Brightness**: Adjust nebula intensity (0.8-1.8x multiplier)
- **Colors**: Fine-tune color saturation (1.0-1.6x multiplier)
- **Hue Shift**: Cycle through color variations (0-20 degrees)
- **Size Pulse**: Control subtle scale animation (1.000-1.050x)

### Interface Elements
- **⚙️ Controls Button**: Toggle control panel visibility (debug mode only)
- **⛶ Fullscreen Button**: Enter/exit fullscreen mode
- **Control Panel**: Glassmorphism design with smooth transitions

## File Structure

```
heart_nebula/
├── index.html          # Main HTML file with embedded structure
├── css/
│   └── styles.css      # Complete styling and animations
├── js/
│   └── script.js       # Interactive controls and animation logic
├── nebu.jpg           # Heart Nebula (IC 1805) texture image
├── rules.md           # Development guidelines and best practices
└── README.md          # This documentation
```

## Technical Details

### Animation System
- **Sine Wave Interpolation**: Ultra-smooth 28-keyframe animation system
- **Cubic-Bezier Easing**: Natural breathing rhythm with `cubic-bezier(0.37, 0, 0.63, 1)`
- **CSS Custom Properties**: Dynamic real-time parameter updates
- **Micro-variations**: ±2% random fluctuations for realistic movement
- **Hardware Acceleration**: `will-change` optimizations for smooth performance

### Visual Effects Pipeline
1. **Base Image**: High-resolution Heart Nebula photograph
2. **CSS Animations**: Keyframe-based pulsing with variable timing
3. **Filter Stack**: Brightness, saturation, and hue-rotate effects
4. **Transform Layer**: Subtle scale animations for depth
5. **Backdrop Effects**: Glassmorphism UI with blur filters

### Performance Optimizations
- **GPU Acceleration**: Hardware-accelerated transforms and filters
- **Smooth Transitions**: Optimized easing curves for 60fps animation
- **Efficient Rendering**: Minimal DOM manipulation with CSS-driven effects
- **Responsive Design**: Viewport-optimized for all screen sizes

## Browser Compatibility

Works in all modern browsers supporting:
- CSS Custom Properties (CSS Variables)
- CSS `backdrop-filter` for glassmorphism effects
- HTML5 Range inputs
- ES6+ JavaScript features
- CSS Animations and Transforms

## Development

### Debug Mode
Enable developer controls by adding `?debug=1` to the URL:
- Reveals the interactive control panel
- Shows parameter value displays
- Enables real-time effect adjustment
- Perfect for fine-tuning the visual experience

### Customization
- **Replace `nebu.jpg`** with any nebula or space image
- **Modify animation keyframes** in `styles.css` for different effects
- **Adjust parameter ranges** in the HTML sliders
- **Customize color schemes** through the hue shift controls

## License

Open source project - feel free to modify and share!

---

**Experience the cosmic beauty of the Heart Nebula with smooth, customizable animations** 🌌✨