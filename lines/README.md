# Lines - Interactive Art Experience

✨ Immerse yourself in a mesmerizing world of flowing lines that respond to your touch and movement. This interactive art piece creates a dynamic canvas where colorful lines fade in and out, creating an ever-changing visual symphony.

🎨 Customize your experience with intuitive controls - adjust line thickness, length, and watch as your artistic vision comes to life. The minimalist interface keeps the focus on the art while giving you creative freedom.

🧹 Use the realistic gum eraser to remove lines and create your own patterns. The satisfying eraser effect lets you "draw" with negative space, adding another dimension to your creative process.

🎵 Experience spatial soundscapes that move through your environment as lines interact. The gentle tones flow from side to side, creating a three-dimensional audio experience that complements the visual elements with subtle movement.

📱 Fully optimized for both desktop and mobile devices, this responsive art piece adapts to any screen size. Perfect for a moment of calm reflection or creative exploration.

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
