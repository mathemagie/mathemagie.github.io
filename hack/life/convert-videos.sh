#!/bin/bash

# Auto-convert WebM videos to MP4 for Instagram
# Usage: ./convert-videos.sh

echo "🎬 Converting WebM videos to MP4..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Counter for converted files
converted=0

# Find all .webm files in current directory and subdirectories
for webm_file in *.webm; do
    # Skip if no files found
    if [ ! -f "$webm_file" ]; then
        echo "No WebM files found in current directory"
        break
    fi

    # Create output filename
    mp4_file="${webm_file%.webm}.mp4"

    # Skip if MP4 already exists
    if [ -f "$mp4_file" ]; then
        echo "⏭️  Skipping: $mp4_file already exists"
        continue
    fi

    echo "🔄 Converting: $webm_file → $mp4_file"

    # Convert with high quality settings for Instagram
    ffmpeg -i "$webm_file" \
        -c:v libx264 \
        -preset slow \
        -crf 18 \
        -c:a aac \
        -b:a 192k \
        -pix_fmt yuv420p \
        -movflags +faststart \
        "$mp4_file" \
        -y \
        -loglevel error

    if [ $? -eq 0 ]; then
        echo "✅ Success: $mp4_file"
        converted=$((converted + 1))
    else
        echo "❌ Failed: $webm_file"
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Converted $converted file(s)"
echo ""

if [ $converted -gt 0 ]; then
    echo "📱 Ready for Instagram! Upload the .mp4 files"
fi
