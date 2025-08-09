#!/bin/bash

# Radio ISS Deployment Verification Script
# Checks if the latest version is deployed on GitHub Pages

set -e

URL="https://mathemagie.github.io/hack/radio_iss/"
EXPECTED_COMMIT=$(git log --format="%h" -1 2>/dev/null || echo "unknown")
TEMP_FILE="/tmp/radio_iss_index.html"

echo "🚀 Radio ISS Deployment Verification"
echo "======================================"
echo "URL: $URL"
echo "Expected commit: $EXPECTED_COMMIT"
echo ""

# Fetch the live page with cache-busting to avoid stale CDN
echo "📥 Fetching live page (cache-busting)..."
TS=$(date +%s)
FETCH_URL="${URL}?v=${TS}"
if curl -s -L -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' "$FETCH_URL" -o "$TEMP_FILE"; then
    echo "✅ Successfully fetched page"
else
    echo "❌ Failed to fetch page"
    exit 1
fi

# Look for version comment
echo ""
echo "🔍 Searching for version comment..."
VERSION_LINE=$(grep -o '<!-- Version: commit [^>]*-->' "$TEMP_FILE" 2>/dev/null || echo "")

if [ -n "$VERSION_LINE" ]; then
    echo "✅ Found version comment:"
    echo "   $VERSION_LINE"
    
    # Extract commit hash from comment
    DEPLOYED_COMMIT=$(echo "$VERSION_LINE" | grep -o 'commit [a-f0-9]\{7\}' | cut -d' ' -f2)
    
    if [ "$DEPLOYED_COMMIT" = "$EXPECTED_COMMIT" ]; then
        echo "✅ Deployment is UP TO DATE! ($DEPLOYED_COMMIT)"
    else
        echo "⚠️  Deployment may be outdated:"
        echo "   Expected: $EXPECTED_COMMIT"
        echo "   Deployed: $DEPLOYED_COMMIT"
        echo "   (GitHub Pages may still be deploying...)"
    fi
else
    echo "❌ No version comment found in deployed page"
    echo "   This might indicate an old version or deployment issue"
fi

# Check cache-busting parameters
echo ""
echo "🔍 Checking cache-busting parameters..."
CACHE_PARAMS=$(grep -o 'v=[0-9]\{10\}' "$TEMP_FILE" | sort -u)
if [ -n "$CACHE_PARAMS" ]; then
    echo "✅ Found cache-busting parameters:"
    echo "$CACHE_PARAMS" | sed 's/^/   /'
    
    # Count unique parameters
    PARAM_COUNT=$(echo "$CACHE_PARAMS" | wc -l)
    echo "   Total unique parameters: $PARAM_COUNT"
else
    echo "❌ No cache-busting parameters found"
fi

# Check for 20-region indicator
echo ""
echo "🔍 Checking for 20-region expansion..."
if grep -q "20 radio regions" "$TEMP_FILE"; then
    echo "✅ Found 20-region indicator in version comment"
else
    echo "❌ No 20-region indicator found"
fi

# Check if page loads with radio UI
echo ""
echo "🔍 Checking page structure..."
CHECKS=(
    "radio-ui:Radio UI container"
    "play-btn:Play button"
    "station-label:Station label"
    "fullscreen-btn:Fullscreen button"
)

for check in "${CHECKS[@]}"; do
    id="${check%%:*}"
    name="${check##*:}"
    if grep -q "id=\"$id\"" "$TEMP_FILE"; then
        echo "✅ $name found"
    else
        echo "❌ $name missing"
    fi
done

# Cleanup
rm -f "$TEMP_FILE"

echo ""
echo "🏁 Verification complete!"
echo "💡 If deployment is outdated, wait 1-10 minutes for GitHub Pages to update"