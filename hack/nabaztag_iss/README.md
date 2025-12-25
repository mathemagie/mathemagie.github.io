# Nabaztag ISS Tracker

A real-time web application that tracks the International Space Station (ISS) and displays its current position on an interactive world map. This project also documents a creative IoT integration where a Nabaztag robot wiggles its ears when the ISS passes over France.

![Nabaztag ISS Tracker](https://img.shields.io/badge/Status-Live-brightgreen) ![License](https://img.shields.io/badge/License-Open%20Source-blue)

## 🌟 Features

- **Real-Time ISS Tracking**: Live position updates every 5 seconds using the Where The ISS At API
- **Interactive Map**: Beautiful Leaflet-based world map with custom ISS marker
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Space-Themed UI**: Stunning space-inspired design with animated starfield background and glowing effects
- **Accessibility**: Semantic HTML with ARIA labels and keyboard navigation support
- **Video Integration**: Embedded demonstration video of the Nabaztag robot in action
- **Performance Optimized**: CDN-loaded dependencies with preconnect hints for faster loading

## 🚀 Quick Start

### Prerequisites

No build tools or package managers required! This is a pure static website that works with any modern web browser.

### Installation

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/mathemagie/nabaztag_ISS.git
   cd nabaztag_ISS
   ```

2. **Open in a browser**
   
   Simply open `index.html` in your web browser, or use a local HTTP server:

   ```bash
   # Option 1: Python 3
   python3 -m http.server 8000
   
   # Option 2: Node.js (if you have http-server installed)
   npx http-server -p 8000
   
   # Option 3: PHP
   php -S localhost:8000
   ```

3. **Navigate to the application**
   
   Open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
nabaztag_iss/
├── index.html          # Main HTML structure and page content
├── map.js             # ISS tracking logic and map initialization
├── styles.css         # Space-themed CSS styling
├── nabaztag_ISS_scaled_x2.mp4  # Demo video of Nabaztag robot
├── README.md          # This documentation file
└── CLAUDE.md          # Development notes for AI assistants
```

## 🏗️ Architecture

### Technology Stack

This is a **vanilla JavaScript static site** with no build process. All dependencies are loaded via CDN:

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, animations, and responsive design
- **JavaScript (ES6+)**: Async/await, modern DOM APIs
- **Leaflet 1.9.4**: Interactive map rendering
- **Font Awesome 6.5.1**: Icon library
- **Google Fonts**: Orbitron (headings) and Space Mono (body text)

### External APIs

- **Where The ISS At API**: `https://api.wheretheiss.at/v1/satellites/25544`
  - Provides real-time ISS position data (latitude, longitude, altitude, velocity)
  - No API key required
  - Rate limit: Reasonable use (updates every 5 seconds is acceptable)

### Key Components

#### 1. HTML Structure (`index.html`)

The page follows a semantic structure:

- **Header**: Site title and home navigation link
- **Description Section**: Project explanation with links to Python code
- **Media Section**: Embedded video demonstration
- **ISS Info Display**: Real-time coordinates display
- **Map Container**: Leaflet map for ISS visualization
- **Footer**: Copyright and GitHub link

**Key Features:**
- Open Graph and Twitter Card meta tags for social sharing
- Preconnect hints for performance optimization
- Accessibility attributes (`aria-label`, `aria-live`, `sr-only`)
- Video with captions support

#### 2. Map Logic (`map.js`)

The core functionality for ISS tracking:

```javascript
// Main components:
- Map initialization with Leaflet
- Custom ISS icon marker
- API fetch function with error handling
- Automatic position updates every 5 seconds
- Map centering and panning animations
```

**Key Functions:**

- `updateIssPosition()`: Async function that fetches ISS data and updates the map
- Error handling with consecutive error tracking (stops after 3 failures)
- Smooth map animations for ISS movement
- First-load vs. update behavior differentiation

#### 3. Styling (`styles.css`)

Space-themed design system:

- **Color Palette**: Dark space background (`#0a0e27`) with cyan accents (`#00d4ff`)
- **Typography**: Orbitron for headings, Space Mono for body text
- **Animations**: Fade-in animations, title pulse effect, wiggle animation
- **Responsive Breakpoints**: 
  - Desktop: 1024px+
  - Tablet: 768px - 1023px
  - Mobile: 480px - 767px
  - Small Mobile: < 480px
- **Accessibility**: Reduced motion support, touch device optimizations

## 💻 Code Documentation

### ISS Position Updates

The application fetches ISS position data every 5 seconds:

```javascript
// API endpoint
const issApiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';

// Update function
async function updateIssPosition() {
    const response = await fetch(issApiUrl);
    const data = await response.json();
    const { latitude, longitude } = data;
    
    // Update marker position
    issMarker.setLatLng([latitude, longitude]);
    
    // Center map on ISS
    map.panTo([latitude, longitude], { animate: true });
    
    // Update info display
    issInfo.innerHTML = `Latitude: ${latitude.toFixed(4)} | Longitude: ${longitude.toFixed(4)}`;
}
```

### Map Configuration

The Leaflet map is configured for optimal user experience:

```javascript
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    tap: true,              // Mobile touch support
    tapTolerance: 15,       // Better mobile UX
    zoomDelta: 0.25,        // Smooth zoom steps
    zoomSnap: 0.25          // Fractional zoom levels
}).setView([46.2, 2.2], 3); // Initial view centered on France
```

### Error Handling

The application includes robust error handling:

- Tracks consecutive API failures
- Stops updates after 3 consecutive errors to prevent spam
- Displays user-friendly error messages
- Logs errors to console for debugging

```javascript
let consecutiveErrors = 0;
const MAX_ERRORS = 3;

// In updateIssPosition():
if (consecutiveErrors >= MAX_ERRORS) {
    clearInterval(updateInterval);
}
```

## 🎨 Customization

### Changing Update Frequency

To change how often the ISS position updates, modify the interval in `map.js`:

```javascript
// Change from 5 seconds to 10 seconds
const updateInterval = setInterval(updateIssPosition, 10000);
```

### Customizing Colors

Edit the CSS custom properties in `styles.css`:

```css
:root {
    --primary-bg: #0a0e27;      /* Main background */
    --accent: #00d4ff;          /* Accent color (cyan) */
    --accent-glow: #0095ff;     /* Glow effect color */
    --card-bg: #1a1f3a;         /* Card background */
    /* ... more variables ... */
}
```

### Changing Map Center

Modify the initial map view in `map.js`:

```javascript
// Change initial center and zoom level
map.setView([latitude, longitude], zoomLevel);
```

### Custom ISS Icon

Replace the ISS icon by modifying the icon URL in `map.js`:

```javascript
const issIcon = L.icon({
    iconUrl: 'your-custom-icon-url.svg',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
});
```

## 🔗 Related Projects

### Python Nabaztag Controller

The physical Nabaztag robot is controlled by a separate Python script:

- **GitHub Repository**: [nabaztag_ISS](https://github.com/mathemagie/nabaztag_ISS)
- **Python Code**: [ear.py](https://raw.githubusercontent.com/mathemagie/nabaztag_ISS/main/ear.py)

The Python script:
- Polls the ISS API every 5 seconds
- Checks if ISS is over France (latitude 41.3°N to 51.1°N, longitude -5.1°W to 8.2°E)
- Sends HTTP commands to the Nabaztag robot to wiggle its ears
- Runs continuously on a local machine or Raspberry Pi

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Required Features:**
- ES6+ JavaScript (async/await, fetch API)
- CSS Custom Properties
- CSS Grid and Flexbox

## ♿ Accessibility

This project follows web accessibility best practices:

- **Semantic HTML**: Proper use of headings, articles, sections
- **ARIA Labels**: Screen reader support for interactive elements
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Visible focus states for keyboard users
- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **Alt Text**: Descriptive text for images and videos
- **Color Contrast**: WCAG AA compliant color combinations

## 🐛 Troubleshooting

### Map Not Displaying

1. **Check browser console** for JavaScript errors
2. **Verify internet connection** (map tiles load from OpenStreetMap)
3. **Check Leaflet CDN** is accessible
4. **Clear browser cache** and reload

### ISS Position Not Updating

1. **Check API status**: Visit `https://api.wheretheiss.at/v1/satellites/25544` directly
2. **Check browser console** for fetch errors
3. **Verify CORS** (API should allow cross-origin requests)
4. **Check network tab** in browser DevTools

### Video Not Playing

1. **Check video file path** is correct
2. **Verify video format** (MP4 with H.264 codec recommended)
3. **Check browser video codec support**
4. **Mobile browsers** may require user interaction before autoplay

## 📝 Development Notes

### Adding New Features

When adding new features:

1. **Keep it static**: No build process required
2. **Use CDN dependencies**: Avoid npm packages
3. **Maintain accessibility**: Add ARIA labels and keyboard support
4. **Test responsiveness**: Check all breakpoints
5. **Optimize performance**: Use preconnect for external resources

### Code Style

- **JavaScript**: ES6+ with async/await
- **CSS**: BEM-like naming convention (`component__element`)
- **HTML**: Semantic HTML5 with accessibility attributes
- **Comments**: Inline comments explain complex logic

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Maintain the static site architecture (no build tools)
- Follow existing code style and naming conventions
- Add comments for complex logic
- Test on multiple browsers and devices
- Ensure accessibility standards are met

## 📄 License

This project is open source. Please check the repository for specific license details.

## 👤 Author

**Mathemagie**

- GitHub: [@mathemagie](https://github.com/mathemagie)
- Project: [Nabaztag ISS](https://github.com/mathemagie/nabaztag_ISS)

## 🙏 Acknowledgments

- **Where The ISS At**: For providing the free ISS tracking API
- **OpenStreetMap**: For the free map tiles
- **Leaflet**: For the excellent mapping library
- **Nabaztag Community**: For inspiration and support

## 📚 Additional Resources

- [Where The ISS At API Documentation](https://wheretheiss.at/)
- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Made with 🌌 for space enthusiasts and IoT hobbyists**

