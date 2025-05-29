# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a standalone HTML5 Brick Breaker game built as a single-file application. The entire game is contained within `index.html` with embedded CSS and JavaScript - no build process or external dependencies required.

## Architecture

- **Single-file structure**: All code (HTML, CSS, JavaScript) is embedded in `index.html`
- **Vanilla JavaScript**: Uses pure JavaScript with Canvas API for game rendering
- **ES modules via importmap**: React is imported via ESM CDN for potential future use
- **Canvas-based rendering**: Game graphics rendered using HTML5 Canvas 2D context
- **Game state management**: Uses enum-based state machine (IDLE, SERVING, PLAYING, GAME_OVER, YOU_WIN)
- **Sound integration**: Audio file (`sfx_A_sat_20250529_175752.mp3`) for brick hit effects

## Key Components

- **Game loop**: `gameLoop()` function handles rendering and game logic at ~60 FPS
- **Input handling**: Supports both keyboard (arrow keys, space, enter) and gamepad input
- **Collision detection**: Ball-wall, ball-paddle, and ball-brick collision systems
- **UI overlay**: Modal-style message system for game states and scoring

## File Structure

- `index.html` - Complete game implementation
- `sfx_A_sat_20250529_175752.mp3` - Sound effect for brick collisions

## Development Notes

When making changes:
- All game logic is in the `<script>` section of `index.html`
- CSS is embedded in the `<style>` section
- Game constants are defined at the top of the script for easy tuning
- Responsive design considerations are handled via CSS media queries
- Path handling accounts for both local development and GitHub Pages deployment