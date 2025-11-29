#!/bin/bash

# Auto-convert watcher for WebM videos
# Watches Downloads folder and auto-converts new cellular-life videos to MP4
# Usage: ./auto-convert-watcher.sh

echo "👀 Watching for new cellular-life videos..."
echo "📂 Monitoring: ~/Downloads"
echo "Press Ctrl+C to stop"
echo ""

# Get Downloads folder
DOWNLOAD_DIR="$HOME/Downloads"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Check if fswatch is installed (for macOS file watching)
if ! command -v fswatch &> /dev/null; then
    echo "⚠️  Installing fswatch for file watching..."
    echo "Run: brew install fswatch"
    echo ""
    echo "Alternative: Run convert-videos.sh manually after each recording"
    exit 1
fi

# Watch Downloads folder for new .webm files
fswatch -0 "$DOWNLOAD_DIR" | while read -d "" event
do
    # Check if it's a cellular-life webm file
    if [[ "$event" == *"cellular-life"* ]] && [[ "$event" == *".webm" ]]; then
        # Wait a moment for download to complete
        sleep 2

        if [ -f "$event" ]; then
            echo "🎬 New video detected: $(basename "$event")"

            # Create MP4 filename
            mp4_file="${event%.webm}.mp4"

            # Check if already converted
            if [ -f "$mp4_file" ]; then
                echo "⏭️  Already exists: $(basename "$mp4_file")"
                continue
            fi

            echo "🔄 Converting to MP4..."

            # Convert with Instagram-optimized settings
            ffmpeg -i "$event" \
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
                echo "✅ Ready: $(basename "$mp4_file")"
                echo "📱 Upload to Instagram!"

                # Optional: Delete the webm file
                # rm "$event"
            else
                echo "❌ Conversion failed"
            fi
            echo ""
        fi
    fi
done
