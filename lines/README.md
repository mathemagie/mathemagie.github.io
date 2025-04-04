# Random Lines - Creative p5.js Visualization

A dynamic, interactive visualization that creates animated random lines with custom controls for visual parameters. Built with p5.js for creative coding.

![Random Lines Demo](https://via.placeholder.com/800x400?text=Random+Lines+Demo)

## Features

- **Generative Line Art**: Automatic creation of animated lines with varying parameters
- **Interactive Controls**: Adjust line thickness, length, and more
- **Color Themes**: Choose from Random, Neon, Pastel, and Monochrome palettes
- **Eraser Tool**: Remove lines by hovering and clicking
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Custom animation loop for smooth performance

## Installation

This project is a static web application with no backend dependencies. You only need a modern web browser to run it.

### Basic Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mathemagie/mathemagie.github.io.git
   cd mathemagie.github.io/lines
   ```

2. Open `index.html` in your browser to run the application.

### Development Environment

For active development with live reload:

1. Install Python and pip (if not already installed)

2. Install the livereload package:
   ```bash
   pip install livereload
   ```

3. Start the development server:
   ```bash
   make dev
   ```

4. Open http://localhost:8000 in your browser

## Usage

- **Control Panel**: Click the gear icon (⚙) in the top right to open/close the control panel
- **Line Thickness**: Adjust the slider to change line width
- **Line Length**: Modify how long the generated lines appear
- **Color Themes**: 
  - Random: Full spectrum random colors
  - Neon: Bright, vibrant colors
  - Pastel: Soft, light colors
  - Mono: Monochrome blue variations
- **Eraser**: Click and drag on the canvas to erase lines

## Development Commands

The project includes a Makefile with useful commands:

```bash
make help     # Show all available commands
make dev      # Start the development server with live reload
make open     # Open the project in your default browser
make start    # Start server and open browser in one command
```

## Technologies

- [p5.js](https://p5js.org/) - JavaScript library for creative coding
- HTML5 Canvas for rendering
- CSS3 for styling
- JavaScript (ES6+) for interaction

## Future Improvements

See [improve.md](improve.md) for planned enhancements including:
- Additional drawing tools and controls
- Visual effects
- Performance optimizations
- Mobile responsive improvements
- Save and share functionality

## License

MIT © [mathemagie](https://github.com/mathemagie)