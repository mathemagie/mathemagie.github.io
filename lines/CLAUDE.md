# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Description
A dynamic p5.js visualization that creates animated random lines with intersection detection and interactive controls.

## Project Structure
- `index.html` - Main HTML file for the p5.js visual application
- `js/script.js` - Core JavaScript logic for the line generation and interaction
- `css/styles.css` - Styling for the application UI
- `tests/` - Jest test files for JavaScript utilities
- `improve.md` - List of planned enhancements

## Style Guidelines
- Use camelCase for variable and function names 
- Maintain consistent 4-space indentation throughout files
- Follow p5.js conventions for drawing functions
- Group related functions together
- Use descriptive variable names that reflect their purpose
- Add comments for complex mathematical calculations
- Maintain existing color theming approach

## Development Workflow
- Test in browser by opening index.html locally
- Validate HTML with W3C validator
- For CSS changes, check mobile responsiveness
- When modifying visual elements, test on different screen sizes
- Run `npm test` after each iteration
- If tests pass, commit all changes and push to remote repository

## Testing
- Tests use Jest with jsdom environment
- Run `npm test` to execute test suite
- Current tests focus on mathematical utilities (distSq, pointSegmentDistance)

## Linting and Formatting
- Run `npm run lint` to check code quality
- Run `npm run format` to automatically format code
- Run `npm run fix` to fix and format all files

## Performance Considerations
- Keep animation frame rate optimization in mind
- Use spatial partitioning for efficient collision detection
- Minimize DOM operations during animation loops
- Reduce operations on mobile devices (fewer lines, lower frame rate)

## Implemented Features
- Animated line generation with growth and fade effects
- Spatial partitioning for efficient collision detection
- Sound effects for line intersections
- Touch and mouse interaction
- UI controls for line thickness, length and sound settings

## Planned Improvements
See improve.md for the complete list of planned enhancements
