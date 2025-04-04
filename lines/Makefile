# Makefile for p5.js random lines project

# Development server with live reload
# Requires livereload package: pip install livereload
dev:
	@echo "Starting development server with live reload..."
	@livereload -p 8000

# Open project in default browser
open:
	@echo "Opening project in browser..."
	@open http://localhost:8000

# Run both dev server and open browser
start: dev open

# Help command
help:
	@echo "Available commands:"
	@echo "  make dev    - Start development server with livereload (requires: pip install livereload)"
	@echo "  make open   - Open project in default browser"
	@echo "  make start  - Start server and open browser"
	@echo "  make help   - Show this help message"

.PHONY: dev open start help