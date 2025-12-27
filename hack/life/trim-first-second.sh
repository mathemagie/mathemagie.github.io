#!/bin/bash

# Trim first second from MP4 video file
# Usage:
#   ./trim-first-second.sh video.mp4
#   ./trim-first-second.sh video.mp4 output.mp4

# Check if file path is provided
if [ -z "$1" ]; then
    echo "❌ Error: No file specified"
    echo "Usage: $0 <input.mp4> [output.mp4]"
    echo "  If output.mp4 is not specified, input file will be replaced"
    exit 1
fi

INPUT_FILE="$1"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: File not found: $INPUT_FILE"
    exit 1
fi

# Check if it's an MP4 file
if [[ "$INPUT_FILE" != *.mp4 ]]; then
    echo "❌ Error: File must be an MP4: $INPUT_FILE"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Determine output file
if [ -n "$2" ]; then
    # Output file specified
    OUTPUT_FILE="$2"
else
    # Replace input file - use temporary file first
    OUTPUT_FILE="${INPUT_FILE%.mp4}-trimmed.mp4"
    REPLACE_ORIGINAL=true
fi

echo "✂️  Trimming first second from: $(basename "$INPUT_FILE")"

# First, check video duration to ensure it's longer than 1 second
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT_FILE" 2>/dev/null)

if [ -z "$DURATION" ] || [ "$DURATION" = "N/A" ]; then
    echo "⚠️  Warning: Could not determine video duration, attempting trim anyway..."
else
    # Compare duration (check if greater than 1.5 seconds to be safe)
    # Use awk for floating point comparison (more portable than bc)
    IS_TOO_SHORT=$(echo "$DURATION" | awk '{if ($1 <= 1.5) print "1"; else print "0"}')
    
    if [ "$IS_TOO_SHORT" = "1" ]; then
        echo "⚠️  Warning: Video is too short ($(printf "%.2f" "$DURATION" 2>/dev/null || echo "$DURATION")s), skipping trim"
        if [ "$REPLACE_ORIGINAL" != true ]; then
            # If output specified, just copy the file
            cp "$INPUT_FILE" "$OUTPUT_FILE"
        fi
        exit 0
    fi
fi

# Try trimming using input seeking first (fastest - no re-encoding)
# Using -c copy is very fast as it doesn't re-encode, just copies streams
FFMPEG_OUTPUT=$(ffmpeg -nostdin \
    -ss 1 \
    -i "$INPUT_FILE" \
    -c copy \
    -avoid_negative_ts make_zero \
    "$OUTPUT_FILE" \
    -y \
    -loglevel warning -hide_banner 2>&1)

FFMPEG_EXIT=$?

# If input seeking with copy failed, try with re-encoding (slower but more reliable)
if [ $FFMPEG_EXIT -ne 0 ] || [ ! -f "$OUTPUT_FILE" ] || [ ! -s "$OUTPUT_FILE" ]; then
    echo "  Trying alternative method (re-encoding)..."
    
    FFMPEG_OUTPUT=$(ffmpeg -nostdin \
        -ss 1 \
        -i "$INPUT_FILE" \
        -c:v libx264 \
        -preset fast \
        -crf 23 \
        -c:a aac \
        -b:a 192k \
        -pix_fmt yuv420p \
        -avoid_negative_ts make_zero \
        "$OUTPUT_FILE" \
        -y \
        -loglevel warning -hide_banner 2>&1)
    
    FFMPEG_EXIT=$?
fi

# Check if trimming succeeded
if [ $FFMPEG_EXIT -eq 0 ] && [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    # If we're replacing the original, move trimmed file to original location
    if [ "$REPLACE_ORIGINAL" = true ]; then
        mv "$OUTPUT_FILE" "$INPUT_FILE"
        echo "✅ Success: Trimmed file saved to $(basename "$INPUT_FILE")"
    else
        echo "✅ Success: Trimmed file saved to $(basename "$OUTPUT_FILE")"
    fi
    exit 0
else
    echo "❌ Error: Trimming failed"
    # Show actual error if available
    if [ -n "$FFMPEG_OUTPUT" ]; then
        echo "$FFMPEG_OUTPUT" | grep -i "error" | head -3
    fi
    # Remove output file if it exists but is corrupted
    [ -f "$OUTPUT_FILE" ] && rm -f "$OUTPUT_FILE"
    exit 1
fi

