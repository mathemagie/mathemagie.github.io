#!/bin/bash

# Generate PNG icons from SVG
# Requires: brew install imagemagick

echo "🎨 Generating extension icons..."

if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found"
    echo "Install with: brew install imagemagick"
    exit 1
fi

cd "$(dirname "$0")/icons"

# Generate different sizes
for size in 16 32 48 128; do
    echo "Creating icon${size}.png..."
    convert -background none -resize ${size}x${size} icon.svg icon${size}.png
done

echo "✅ Icons generated successfully!"
echo ""
echo "Generated files:"
ls -lh icon*.png
