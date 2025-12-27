# 25544.fm (ISS Orbital Radio) - Commit History

**Note**: Project renamed from "Radio ISS" to "25544.fm" - NORAD catalog number for the ISS.

## Recent UI & Feature Development

### **feat(radio_iss): increase radio UI size for better text visibility**
*Commit: 223720d*
- Expanded desktop width from 140px to 200px (~43% increase)
- Increased mobile width from 140px to 220px (~57% increase) 
- Enlarged station info font from 11px to 12px for better readability
- Boosted mobile station text from 12px to 13px
- Increased hint text from 10px to 11px
- Improved station text contrast (opacity 0.9 → 0.95)
- Added line-height 1.2 for station info spacing
- Expanded min-width for station text (60px → 100px)
- Updated viewport scaling (40vw → 60vw desktop, 50vw → 70vw mobile)
- Reduced text truncation for longer station names like "SomaFM Groove Salad"

### **refactor(radio_iss): simplify radio UI to minimal badge with hint fade-out**
*Commit: 3274bc9*
- Removed unnecessary elements (title, time display, progress bar) for cleaner design
- Transformed to compact pill-shaped badge with play button + station info
- Changed station format from "Station — Region" to "Station • Region" 
- Reduced size by ~30% (140px vs 200px max-width) while maintaining readability
- Preserved hint text with 2-second fade-out after play button click
- Added mobile responsiveness with larger touch targets (32px on mobile)
- Implemented vertical layout stacking controls above hint text
- Fixed CSS duplicate selector and updated test to match new station format
- Maintained all existing functionality in simplified interface

### **feat(radio_iss): add radio hint fade-out after play button click**
*Commit: 9e6eaa1*
- Added smooth fade-out animation (0.8s) to radio hint text
- Triggered fade-out 2 seconds after play button is clicked
- Prevented multiple fade-out timers with safety check
- Enhanced user experience by removing instructional text after use
- Added setTimeout to ESLint globals to fix linting error
- Updated cache-busting parameters for CSS and JS files

### **feat(radio_iss): increase radio UI size by 25%**
*Commit: 9a3539b*
- Expanded max-width from 160px to 200px (25% increase)
- Increased min-width from 120px to 150px (25% increase)  
- Updated viewport width from 45vw to 56vw for better responsiveness
- Updated cache-busting parameter for CSS changes

### **fix(radio_iss): replace fullscreen button text with ⛶ icon**
*Commit: 2d8b54b*
- Moved fullscreen button from radio UI to bottom right corner as floating circular button
- Reduced radio UI width by half (160px max) for better space utilization  
- Replaced text-based fullscreen toggle with ⛶ pictogram icon
- Added mobile-responsive design to hide fullscreen button on touch devices
- Updated cache-busting parameters for CSS and JS files

## Testing & Development Infrastructure

### **test(radio_iss): add comprehensive resize functionality unit tests**
*Commit: 6dd78fd*
- Added 15 comprehensive test cases covering all resize functionality
- Complete p5.js function mocking (map, constrain, createVector, color, lerp)
- Tests for particle repositioning, geographic data persistence, ISS wrapping
- Covered error handling for missing data scenarios
- Added tests for velocity limiting and bounds constraints
- Ensured no regressions in resize behavior

### **docs(radio_iss): add cache-busting documentation for development workflow**
*Commit: af1f02a*
- Added cache-busting documentation for development workflow
- Documented timestamp-based parameter system for CSS/JS files
- Added instructions for forcing browser refresh during development
- Updated CLAUDE.md with cache management best practices

### **feat(radio_iss): implement window resize handling and simplify radio UI**
*Commit: 8b04a95*
- Enhanced windowResized() function with debouncing and global variable checks
- Made particles and geographyManager globally accessible immediately in setup()
- Comprehensive repositionParticlesAfterResize() method with error handling
- ISS horizontal wrapping and bounds constraints
- Enhanced ISS particle update() method with world wrapping logic
- Removed volume and menu button references
- Enhanced toggleFullscreen() with resize callbacks

### **docs(radio_iss): update CLAUDE.md with testing and linting documentation**
*Commit: aaea915*
- Updated CLAUDE.md with comprehensive testing and linting documentation
- Documented Vitest testing framework setup and usage
- Added linting infrastructure documentation (ESLint, HTMLHint, Stylelint)
- Included pre-commit hooks configuration and workflow

### **chore(radio_iss): add CSS linting to pre-commit hooks**
*Commit: a18da9e*
- Added stylelint to pre-commit hooks for CSS quality control
- Configured stylelint-config-standard for consistent CSS formatting
- Integrated CSS linting into automated workflow

### **chore(radio_iss): add npm test to pre-commit hooks**
*Commit: 7b95695*
- Added npm test command to pre-commit hooks
- Ensures all tests pass before commits are allowed
- Prevents broken code from entering the repository

## Social Media & Metadata

### **fix(radio_iss): use absolute URLs for Open Graph and Twitter Card images**
*Commit: 53ae847*
- Fixed social media sharing with absolute URLs for Open Graph images
- Updated Twitter Card image references to use complete URLs
- Ensured proper preview generation on social media platforms

### **feat(radio_iss): add Open Graph & Twitter Card metadata**
*Commit: ebd3850*
- Added comprehensive Open Graph metadata for Facebook sharing
- Implemented Twitter Card metadata for enhanced tweet previews
- Added structured metadata for better social media presence
- Included descriptive content and image references

### **chore(radio_iss): add Vitest unit tests and run in pre-commit**
*Commit: 1c23d18*
- Set up Vitest as the modern testing framework
- Added test scripts to package.json
- Configured JSDOM environment for DOM testing
- Integrated testing into pre-commit workflow

## Code Architecture & Quality

### **chore(radio_iss): add linting infrastructure with pre-commit hooks**
*Commit: 73db43b*
- Set up comprehensive code quality tools (ESLint, HTMLHint, Stylelint)
- Configured pre-commit hooks with lint-staged
- Added Husky for Git hook management
- Established consistent code formatting standards

### **docs(radio_iss): update CLAUDE.md to reflect modular architecture**
*Commit: 2faa453*
- Updated documentation to reflect modular code structure
- Documented the separation of concerns into dedicated files
- Added architecture overview and file structure documentation
- Explained the transition from monolithic to modular design

### **fix(radio_iss): resolve undefined continentPoints variable access**
*Commit: d79c58f*
- Fixed critical runtime error in geographic data handling
- Resolved undefined continentPoints variable access
- Ensured proper initialization of geographic data structures
- Added error handling for missing continent data

### **refactor(radio_iss): split monolithic HTML into modular CSS and JS files**
*Commit: a6a09f9*
- Major architecture refactor separating concerns into dedicated files
- Created separate CSS file for all styling (css/styles.css)
- Split JavaScript into modular files (js/main.js, js/radio.js, js/geography.js, js/particles.js)
- Maintained all functionality while improving maintainability
- Enhanced code organization and readability

## Core Features & Functionality

### **feat(radio_iss): enhance radio UI with compact custom audio controls**
*Commit: 4eddcca*
- Implemented custom audio player with progress bars and playback controls
- Added time display showing current time and total duration
- Created compact UI design with play/pause functionality
- Enhanced user experience with visual feedback
- Integrated audio controls with radio streaming

### **feat(radio_iss): add dynamic window resize with geographic coordinate persistence**
*Commit: 36f493a*
- Advanced resize handling maintaining particle positions across dimension changes
- Geographic coordinate persistence during window resizing
- Proper scaling of ISS and continent particle positions
- Maintained visual consistency across different screen sizes

### **docs(radio_iss): add comprehensive README with features and setup guide**
*Commit: ab1b5e9*
- Complete project documentation with feature descriptions
- Installation and setup instructions
- Architecture overview and technical details
- Usage guidelines and development workflow

### **feat(radio_iss): add fullscreen mode (button + 'f' key)**
*Commit: 65ab0f7*
- Dual fullscreen activation methods for enhanced user experience
- Button-based fullscreen toggle in UI
- Keyboard shortcut ('f' key) for quick fullscreen access
- Proper fullscreen state management

### **chore: add Cursor rules reflecting Radio ISS architecture**
*Commit: 4d46e3b*
- Development environment configuration for the modular architecture
- Added .cursorrules file for consistent development experience
- Configured editor rules for the project structure

### **docs: update CLAUDE.md with comprehensive Radio ISS documentation**
*Commit: 92a8def*
- Complete technical documentation of the ISS tracking system
- Radio streaming functionality documentation
- Particle physics engine documentation
- Geographic coordinate system explanation

### **fix: update page title to "Radio ISS"**
*Commit: 629f248*
- Proper page identification and branding
- Updated HTML title tag for better SEO
- Consistent naming across the application

### **feat: add ISS tracker with radio and particle physics**
*Commit: f8260d7*
- Initial implementation of the core ISS tracking visualization
- Real-time radio streaming based on geographic location
- Particle physics simulation with ISS as pulsating red particle
- Integration of radio stations mapped to geographic regions
- Automatic station switching as ISS orbits Earth
- Interactive particle system with continent-based collisions

---

## Project Summary

The Radio ISS project represents a complete evolution from initial concept to a fully-featured, tested, and documented immersive space station tracking experience. The development journey includes:

**Core Innovation**: Real-time ISS tracking combined with location-based internet radio streaming
**Technical Excellence**: Comprehensive testing, linting, and code quality infrastructure  
**User Experience**: Responsive design, intuitive controls, and smooth animations
**Architecture**: Modular code structure with clear separation of concerns
**Documentation**: Complete technical and user documentation

This project demonstrates modern web development practices with a unique fusion of space tracking, particle physics simulation, and regional internet radio streaming.