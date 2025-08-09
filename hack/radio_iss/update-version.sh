#!/bin/bash

# Manual script to update version comment with latest commit hash
# Usage: ./update-version.sh

set -e

INDEX_FILE="index.html"

echo "🔄 Updating version comment with latest commit hash..."

# Get the latest commit hash (7 characters)
LATEST_COMMIT=$(git log --format="%h" -1 2>/dev/null || echo "unknown")

# Check if version comment exists
if grep -q "<!-- Version: commit" "$INDEX_FILE"; then
    # Update existing version comment
    sed -i.bak "s/<!-- Version: commit [a-f0-9]\{7\} - /<!-- Version: commit $LATEST_COMMIT - /" "$INDEX_FILE"
    
    # Remove backup file
    rm -f "${INDEX_FILE}.bak"
    
    echo "✅ Updated version comment to: $LATEST_COMMIT"
    echo "📝 File: $INDEX_FILE"
    
    # Show the updated line
    echo "📄 Updated line:"
    grep "<!-- Version: commit" "$INDEX_FILE" | sed 's/^/   /'
    
    echo ""
    echo "💡 Don't forget to commit the change:"
    echo "   git add $INDEX_FILE"
    echo "   git commit -m 'chore: update version comment'"
else
    echo "❌ No version comment found in $INDEX_FILE"
    echo "💡 Expected format: <!-- Version: commit XXXXXXX - description -->"
    exit 1
fi