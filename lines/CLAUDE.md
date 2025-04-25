# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure
- `index.html` - Main HTML file for the p5.js visual application
- `js/script.js` - Core JavaScript logic for the line generation and interaction
- `css/styles.css` - Styling for the application UI

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

## Performance Considerations
- Keep animation frame rate optimization in mind
- Use spatial partitioning for efficient collision detection
- Minimize DOM operations during animation loops