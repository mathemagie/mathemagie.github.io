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

# Lint HTML files
# Requires html-validator-cli: npm install -g html-validator-cli
lint-html:
	@echo "Linting HTML files..."
	@html-validator --file index.html --verbose

# Lint CSS files
# Requires stylelint: npm install -g stylelint stylelint-config-standard
lint-css:
	@echo "Linting CSS files..."
	@stylelint "css/*.css" --config stylelint-config-standard

# Lint all files
lint: lint-html lint-css
	@echo "All linting completed!"

# Help command
help:
	@echo "Available commands:"
	@echo "  make dev       - Start development server with livereload (requires: pip install livereload)"
	@echo "  make open      - Open project in default browser"
	@echo "  make start     - Start server and open browser"
	@echo "  make lint-html - Lint HTML files (requires: npm install -g html-validator-cli)"
	@echo "  make lint-css  - Lint CSS files (requires: npm install -g stylelint stylelint-config-standard)"
	@echo "  make lint      - Run all linters"
	@echo "  make help      - Show this help message"

.PHONY: dev open start lint-html lint-css lint help