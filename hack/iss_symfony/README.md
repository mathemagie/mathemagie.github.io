# Real-Time ISS Tracker with Mercator Projection

A sophisticated web application that tracks the International Space Station (ISS) in real-time using precise Mercator projection mathematics and p5.js visualization.

## ✨ Features

### 🛰️ Core Functionality
- **Real-time ISS tracking** with 2-second updates
- **Precise Mercator projection** mathematics (Web Mercator EPSG:3857)
- **Smooth position animation** with great circle interpolation
- **Orbital path visualization** showing ISS trajectory
- **Audio feedback** when ISS crosses major grid lines

### 🎯 Technical Highlights
- **60 FPS rendering** with p5.js canvas
- **Responsive design** for desktop, tablet, and mobile
- **Dual API support** with automatic failover (Open Notify + Where the ISS at?)
- **Circuit breaker pattern** for robust error handling
- **Performance monitoring** with real-time metrics
- **Accessibility compliant** (WCAG 2.1 AA)

### 🎵 Audio Features
- **Grid crossing detection** with mathematical precision
- **Web Audio API** with HTML5 Audio fallback
- **Volume controls** and mute functionality
- **Browser compatibility** across all modern browsers

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+)
- Internet connection for ISS data APIs
- Local web server (recommended for development)

### Installation

1. **Clone or download** this repository
2. **Serve files** using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server .

# Using PHP
php -S localhost:8000
```

3. **Open your browser** and navigate to `http://localhost:8000`

### CORS and API Access

⚠️ **Important**: Due to CORS (Cross-Origin Resource Sharing) restrictions, some ISS APIs cannot be accessed directly from browsers. The application handles this gracefully:

1. **Primary API**: Uses `wheretheiss.at` (CORS-enabled)
2. **Backup API**: Uses CORS proxy for Open Notify API
3. **Demo Mode**: Falls back to simulated ISS orbit if APIs fail

**For Production Deployment**: Consider setting up your own CORS proxy or use a server-side solution to avoid CORS limitations.

### No Build Process Required
This application uses vanilla JavaScript and CDN resources - no build tools or dependencies required!

## 📁 Project Structure

```
iss-tracker/
├── index.html              # Main application entry point
├── css/
│   ├── styles.css          # Main stylesheet with CSS Grid
│   └── responsive.css      # Mobile responsive styles
├── js/
│   ├── main.js             # Application initialization & p5.js setup
│   ├── mercatorProjection.js # Mercator projection mathematics
│   ├── apiClient.js        # API communication with error handling
│   ├── audioManager.js     # Audio feedback system
│   ├── issTracker.js       # Core ISS tracking logic
│   └── ui.js               # User interface controls
├── assets/
│   ├── images/
│   │   ├── iss-icon.svg    # ISS satellite icon
│   │   └── world-map.svg   # Base world map outline
│   └── audio/              # Audio assets (auto-generated)
├── tests/
│   └── projection.test.js  # Comprehensive test suite
└── README.md               # This file
```

## 🎮 Usage

### Basic Controls
- **Start/Stop Tracking**: Click the main tracking button
- **Update Frequency**: Adjust from 1-10 second intervals
- **Display Options**: Toggle orbital path, grid lines, coordinates
- **Audio Controls**: Enable/disable, volume, mute

### Keyboard Shortcuts
- `Space` - Toggle tracking
- `F` - Toggle fullscreen
- `I` - Show information modal
- `G` - Toggle grid lines
- `P` - Toggle orbital path
- `M` - Toggle audio mute
- `H` - Show keyboard shortcuts
- `Ctrl+D` - Toggle debug panel
- `Esc` - Close modals

### Mobile Support
- **Touch optimized** controls with 44px minimum touch targets
- **Responsive layout** adapts to screen size
- **Swipe gestures** for future enhancements
- **Performance optimized** for mobile devices

## 🔧 Technical Details

### Mercator Projection Mathematics

The application implements precise Web Mercator projection using these formulas:

**Forward Projection (Lat/Lng → Pixels):**
```javascript
x = (longitude + 180) * (mapWidth / 360)
y = (mapHeight / 2) - (mapWidth / (2 * π)) * ln(tan(π/4 + latitude * π/360))
```

**Inverse Projection (Pixels → Lat/Lng):**
```javascript
longitude = (x / mapWidth) * 360 - 180
latitude = (2 * atan(exp((mapHeight/2 - y) / (mapWidth / (2 * π)))) - π/2) * 180/π
```

### API Integration

**Primary API: Open Notify**
- Endpoint: `http://api.open-notify.org/iss-now.json`
- No rate limiting
- Simple JSON response format

**Backup API: Where the ISS at?**
- Endpoint: `https://api.wheretheiss.at/v1/satellites/25544`
- 1 request/second rate limit
- Enhanced data (altitude, velocity, visibility)

### Performance Specifications

- **Target FPS**: 60 (minimum 30)
- **API Response**: < 2 seconds
- **Memory Usage**: < 100MB for extended sessions
- **Initial Load**: < 5 seconds on broadband
- **Projection Accuracy**: ±1 pixel for test coordinates

## 🧪 Testing

### Running Tests

The application includes comprehensive tests for critical components:

```javascript
// Run projection tests in browser console
runProjectionTests();

// View test results
window.issTrackerApp.projection.testProjectionAccuracy();
```

### Test Coverage

- **Mercator Projection**: Accuracy, edge cases, performance
- **API Client**: Error handling, failover, circuit breaker
- **Audio Manager**: Browser compatibility, grid crossing detection
- **UI Controller**: Event handling, responsive behavior

### Manual Testing Checklist

- [ ] ISS position updates every 2 seconds
- [ ] Smooth animation between positions
- [ ] Audio plays when crossing 10° grid lines
- [ ] Responsive design works on mobile
- [ ] Error handling displays appropriate messages
- [ ] Performance stays above 30 FPS

## 🌐 Browser Compatibility

| Browser | Minimum Version | Canvas | Audio | WebGL |
|---------|----------------|--------|-------|-------|
| Chrome  | 88+            | ✅     | ✅    | ✅    |
| Firefox | 85+            | ✅     | ✅    | ✅    |
| Safari  | 14+            | ✅     | ✅    | ✅    |
| Edge    | 88+            | ✅     | ✅    | ✅    |

### Fallback Support
- **Web Audio API** → HTML5 Audio → Silent mode
- **High performance** → Reduced quality → Basic functionality
- **Full features** → Core features → Minimal mode

## 🛠️ Development

### Adding New Features

1. **Create feature branch**: Follow the existing code structure
2. **Update tests**: Add tests for new functionality
3. **Test performance**: Ensure 60 FPS target is maintained
4. **Check accessibility**: Verify WCAG 2.1 AA compliance
5. **Update documentation**: Keep README and comments current

### Code Style Guidelines

- **ES6+ JavaScript**: Use modern syntax and features
- **Modular design**: Keep classes focused and well-defined
- **Error handling**: Implement comprehensive error recovery
- **Performance first**: Optimize for 60 FPS rendering
- **Accessibility**: Semantic HTML and ARIA attributes

### Debug Features

Access debug information via:
```javascript
// Global app object
window.issTrackerApp

// Component access
window.issTrackerApp.projection.getProjectionInfo()
window.issTrackerApp.apiClient.getStats()
window.issTrackerApp.audioManager.getStatus()
```

## 🔒 Security & Privacy

- **No personal data** collection or storage
- **Public APIs only** - no authentication required
- **Client-side only** - no server dependencies
- **Content Security Policy** implemented
- **HTTPS ready** for secure deployment

## 📊 Performance Monitoring

The application includes built-in performance monitoring:

- **FPS counter** - Real-time frame rate display
- **API response times** - Network performance tracking
- **Memory usage** - JavaScript heap monitoring
- **Error tracking** - Comprehensive error logging

## 🚢 Deployment

### Static Hosting Options

**Recommended platforms:**
- [Netlify](https://netlify.com) - Automatic deployments
- [Vercel](https://vercel.com) - Edge optimization
- [GitHub Pages](https://pages.github.com) - Free hosting
- [Firebase Hosting](https://firebase.google.com/products/hosting) - Google infrastructure

### Environment Configuration

**Production checklist:**
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Set up error monitoring
- [ ] Enable compression (gzip/brotli)
- [ ] Configure CDN if needed

## 🤝 Contributing

Contributions are welcome! Please:

1. **Follow code style** guidelines
2. **Add tests** for new features
3. **Update documentation** as needed
4. **Test on multiple browsers**
5. **Ensure accessibility** compliance

## 📜 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- **NASA/ISS Program** - For the amazing International Space Station
- **Open Notify API** - Primary ISS tracking data
- **Where the ISS at?** - Backup API and enhanced data
- **p5.js Community** - Excellent graphics library
- **Web Mercator** - Standard projection for web mapping

## 📞 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Comprehensive inline code documentation
- **Examples**: Live demo and usage examples included

---

**Built with ❤️ for space enthusiasts and developers**

*Real-time ISS tracking has never been this precise and beautiful!*