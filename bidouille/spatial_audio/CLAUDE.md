# Spatial Audio — AirPods head-tracked Web Audio demo

An eyes-open, headphone spatial-audio toy: **you sit at the center**, an ambient
loop orbits your head, and (optionally) **AirPods head tracking** keeps the sound
anchored in the room as you turn your head.

## Pieces

| Path | What it is |
|------|------------|
| `index.html` | The page. Self-contained: Web Audio `PannerNode` (HRTF), generated ambient loop, draggable orb, dark minimal canvas visual, live head-tracking log panel. No build step, no external assets. |
| `headbridge/HeadBridge.swift` | macOS menu-bar agent. Reads AirPods orientation via `CMHeadphoneMotionManager` and broadcasts the quaternion + yaw/pitch/roll as JSON over a WebSocket. |
| `headbridge/Info.plist` | App bundle plist. `LSUIElement` (no dock icon) + `NSMotionUsageDescription` (required for the Motion permission prompt). |
| `headbridge/build.sh` | Compiles `HeadBridge.swift` → `HeadBridge.app`, copies the plist, ad-hoc signs. |

## Run it

```bash
# 1. Serve the page (any static server; pick a free port)
cd bidouille/spatial_audio
python3 -m http.server 8742
# open http://localhost:8742/index.html

# 2. (Optional) Build + run the AirPods head-tracking bridge
cd headbridge
./build.sh
open HeadBridge.app          # grant the Motion permission prompt on first launch
```

Then in the page: **Begin** → drag the orb → put AirPods in. The bottom-center
chip flips `no bridge` → `head ✓` when the bridge is connected. The top-right
panel logs live yaw/pitch/roll, the quaternion, the derived forward vector, and
the sample rate.

- **Recenter** button zeroes "forward" to wherever you're currently facing.
- Without the bridge running, the page still works as a drag-only spatial demo.

## How it fits together

```
AirPods IMU ──CMHeadphoneMotionManager──▶ HeadBridge.app
                                              │  JSON {yaw,pitch,roll,qw,qx,qy,qz}
                                              ▼  ws://localhost:8766
                                          index.html  ──▶  rotates the sound
                                                            source around the
                                                            fixed listener
```

### Key design decisions
- **HRTF panning** (`panningModel: "HRTF"`) is what makes the sound wrap around
  the head on AirPods / any headphones. This is the whole point.
- **Head tracking rotates the SOURCE, not the listener.** We take the scalar
  `yaw` (relative to the recenter pose) and rotate the panner position by
  `-headYaw` around the vertical axis each frame in `updateSpatial()`. This is
  deliberately *not* done by rotating the AudioListener via the quaternion:
  CoreMotion's reference frame and Web Audio's axes don't line up, so the
  quaternion approach leaked horizontal head-turn into the wrong axis and the
  sound stayed head-locked. Using yaw directly guarantees a horizontal head turn
  produces a horizontal shift.
- **`YAW_SIGN` constant** (top of the head-tracking block in `index.html`) flips
  the rotation direction if left/right comes out mirrored. Default `1`; set `-1`
  to mirror.

## Ports
- `8742` — static server for the page (arbitrary; change freely).
- `8766` — HeadBridge WebSocket. **Was 8765**, moved because another project's
  `serve.py 8765` squats that port. The port appears in two places — keep them in
  sync: `HeadBridge.swift` (`server.start(port:)` + menu label) and `index.html`
  (`new WebSocket("ws://localhost:8766")`).

## Gotchas
- **Swift won't compile?** The Mac's Command Line Tools can get into a
  half-updated state (duplicate `SwiftBridging` module / compiler-vs-SDK version
  skew) where *any* `swiftc` fails. Fix: reinstall CLT
  (`sudo rm -rf /Library/Developer/CommandLineTools && sudo xcode-select --install`,
  or `sudo softwareupdate -i "Command Line Tools for Xcode-16.2"`). Not a code bug.
- **Head tracking needs real hardware:** AirPods Pro / 3rd gen / Max, paired and
  worn. `CMHeadphoneMotionManager.isDeviceMotionAvailable` is false otherwise and
  the menu-bar icon shows `🎧⚠️`.
- **Cache busting:** this is a single inline-HTML file — it already sends
  `Cache-Control: no-cache` via a `<meta>` tag, and reloads use a `?v=` query
  string. No external `?v=<hash>` asset bumping needed here.
- **Stop the bridge:** menu-bar `🎧 → Quit`.

## Quick health check (WebSocket stream)

```bash
# Confirms the bridge is streaming live orientation (needs AirPods worn)
python3 - <<'PY'
import socket, base64, os, time
s = socket.create_connection(("127.0.0.1", 8766), timeout=5)
s.send(("GET / HTTP/1.1\r\nHost: localhost:8766\r\nUpgrade: websocket\r\n"
        "Connection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n"
        % base64.b64encode(os.urandom(16)).decode()).encode())
print("handshake:", b"101" in s.recv(1024))
s.settimeout(4); data = s.recv(4096)
print("frame:", data[2:].split(b"}")[0] + b"}")
PY
```
