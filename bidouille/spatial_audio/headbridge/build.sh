#!/bin/bash
# Build HeadBridge.app — a menu-bar agent that streams AirPods head motion
# over ws://localhost:8766. Requires Xcode command-line tools.
set -e
cd "$(dirname "$0")"

APP="HeadBridge.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"

echo "Compiling…"
swiftc -O HeadBridge.swift -o "$APP/Contents/MacOS/HeadBridge" \
  -framework CoreMotion -framework Network -framework AppKit

cp Info.plist "$APP/Contents/Info.plist"

# Ad-hoc sign so macOS will grant the Motion permission prompt.
codesign --force --deep --sign - "$APP" 2>/dev/null || true

echo "Built $APP"
echo "Run it:    open $APP"
echo "Or w/logs: ./$APP/Contents/MacOS/HeadBridge"
