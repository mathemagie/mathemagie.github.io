#!/bin/bash

# 25544.fm Deployment Verification Script
# Checks if the latest version is deployed on GitHub Pages

set -e

URL="https://mathemagie.github.io/hack/radio_iss/"
COMMIT_HASH_URL="https://mathemagie.github.io/COMMIT_HASH.txt"
EXPECTED_COMMIT=$(git log --format="%h" -1 2>/dev/null || echo "unknown")
TEMP_FILE="/tmp/radio_iss_index.html"
DEPLOYED_COMMIT="unknown"

echo "🚀 25544.fm Deployment Verification"
echo "======================================"
echo "URL: $URL"
echo "Expected commit: $EXPECTED_COMMIT"
echo ""

# Fetch the deployed commit hash from COMMIT_HASH.txt
echo "📥 Fetching deployed commit hash from $COMMIT_HASH_URL ..."
DEPLOYED_COMMIT=$(curl -s -L -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' "$COMMIT_HASH_URL" | head -n1 | tr -d '\r\n')
if [[ -z "$DEPLOYED_COMMIT" ]]; then
    echo "❌ Failed to fetch deployed commit hash from $COMMIT_HASH_URL"
    exit 1
fi
echo "Deployed commit: $DEPLOYED_COMMIT"
echo ""


# Compare deployed commit with expected commit
echo ""
echo "🔍 Comparing deployed commit with expected commit..."
if [ "$DEPLOYED_COMMIT" = "$EXPECTED_COMMIT" ]; then
    echo "✅ Deployment is UP TO DATE! ($DEPLOYED_COMMIT)"
else
    echo "⚠️  Deployment may be outdated:"
    echo "   Expected: $EXPECTED_COMMIT"
    echo "   Deployed: $DEPLOYED_COMMIT"
    echo "   (GitHub Pages may still be deploying...)"
fi


# Cleanup
rm -f "$TEMP_FILE"

echo ""
echo "🏁 Verification complete!"
echo "💡 If deployment is outdated, wait 1-10 minutes for GitHub Pages to update"