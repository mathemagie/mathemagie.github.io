# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file interactive shader wallpaper page (`index.html`). Three full-screen GLSL fragment shaders with mouse/gamepad interaction, optional space audio on Deep Nebula, and a visible UI for switching presets.

**Active shaders** (in `WALLPAPERS`):

| Key | ID | Name | Interaction hint |
|-----|-----|------|------------------|
| `1` | `voronoi` | Crystal Lattice | cells align to you · click to shatter |
| `2` | `aurora` | Aurora Drift | ribbons tilt with the cursor · click to gust |
| `3` | `nebula` | Deep Nebula | gravity warps toward you · click to collapse · space audio on pad |

Two more shaders (`mercury`, `plasma`) remain compiled in `SHADERS` but are **not** in `WALLPAPERS` (intentionally inactive).

## Architecture

```
index.html (outer bundler shell)
  ├── __bundler_thumbnail   SVG placeholder (sphere) while unpacking
  ├── __bundler_loading     status toast (bottom-right)
  ├── __bundler/manifest    asset blobs (currently empty {})
  └── __bundler/template    JSON string → real page after unpack
        ├── CSS             dock, HUD, pad-status
        ├── HTML            canvas, HUD, dock, pad-status
        └── <script>        GLSL shaders + WebGL + input + gamepad + audio
```

On success, `document.documentElement.replaceWith()` swaps the outer shell for the inner template. If JSON parse fails, the user stays on the **sphere placeholder** with `Error unpacking: …` — that is not the shader app.

## UI

- **Dock** (`#dock`, bottom center, `display: flex`) — three buttons built from `WALLPAPERS`; click to switch.
- **HUD** (top-left) — `#hud-name`, `#hud-meta` (`01 / 03`), `#hud-hint` (per-shader hint).
- **Pad status** (`#pad-status`, bottom-left) — shows `pad: …` when a gamepad is connected.

### Switching wallpapers

| Input | Action |
|-------|--------|
| Dock buttons | `setWallpaper(id)` |
| `1`–`3` | Jump to wallpaper (range tied to `WALLPAPERS.length`) |
| `←` / `→` | Cycle |
| `localStorage` key `shader-wallpaper` | Remembers last choice |

## Shared shader uniforms

Every fragment shader receives:

- `u_res` — canvas size in pixels
- `u_time` — seconds since load
- `u_mouse` — normalized 0..1, **Y up** (GL coords)
- `u_mouseVel` — smoothed drag velocity
- `u_mouseDown` — 0 or 1
- `u_click` — `xy` position, `z` strength (decays ~1.8s), `w` age

Shared GLSL utilities: `hash*`, `noise`, `fbm`, `rot`, `smin` in `UTILS`.

## Gamepad (DualShock 4 / standard mapping)

Implemented in the template: `scanGamepads`, `pollGamepad`, `pad` state.

| Control | Effect |
|---------|--------|
| Left stick | Move cursor |
| Right stick | Fine aim (40% blend) |
| R2 or Cross (held) | `mouseDown` — stronger pull on nebula |
| Cross (press edge) | `triggerClick()` + `nebulaCollapseBurst()` |
| Circle / PS / touchpad btn | Toggle fullscreen |

**Wiring requirements** (easy to break during edits):

1. `pollGamepad(now, dt)` must be **called** inside `frame()` — defining the function alone does nothing.
2. `scanGamepads()` on load + on first `mousedown` / `keydown` / `touchstart` — Chrome often needs user interaction before `navigator.getGamepads()` returns data.
3. `pad.activity` (0..1) — smoothed stick/trigger intensity; drives nebula audio crossfade.

Gamepad does **not** switch shaders.

## Nebula space audio (Web Audio API)

Procedural audio — no external sound files. Only active when `state.current === 'nebula'`.

| Function | Role |
|----------|------|
| `unlockAudio()` | Creates `AudioContext` on first user gesture |
| `setNebulaAudio(active)` | Fade master in/out when entering/leaving nebula |
| `updateNebulaAudio(dt)` | Crossfade ambient ↔ pilot each frame |
| `nebulaCollapseBurst()` | Short spike on click/collapse |

**Layers:**

- **Ambient** — brown noise + low sine drones (~52/78 Hz), slow breath LFO. Default mouse-only nebula.
- **Pilot** — bandpass-filtered noise + triangle tone; fades in when gamepad is used.

**Direction mapping** (`pad.dirX`, `pad.dirY`, `pad.dirMag` — smoothed stick vector from `pollGamepad`):

| Stick | Audio response |
|-------|----------------|
| **Magnitude** (any direction) | Master volume swells (`baseVol × ~0.35…1.9` when piloting) |
| **Up / down** (`dirY`) | Filter + oscillator pitch (up = brighter climb, down = deep dive) |
| **Horizontal + vertical** | Pilot layer gain and filter Q boost |

Spatial position is driven by the **cursor / gravity-well location** (`state.mouseT`), not the raw stick vector — see Spatialization below. The stick moves the cursor, so it still steers the sound; the mouse does too.

**Spatialization:** `sfx.panner` is an HRTF `PannerNode`; `ctx.listener` is the **head at the center of the page**, fixed at origin facing `-Z`. Each frame the source is placed from the cursor / gravity-well position (`state.mouseT`, normalized 0–1, recentered to ±1): X = left/right across the screen, Y = up/down (elevation), Z fixed at `-R·0.6` so the screen acts as a window in front of you. The sound comes from wherever the glowing well sits on screen — driven by mouse **or** gamepad (both move `state.mouseT`). `refDistance == sfx.spatialR` keeps distance gain ~flat so the explicit `master.gain` swell stays authoritative. Built in `unlockAudio`, driven in `updateNebulaAudio`. Replaced the old `StereoPannerNode`.

**User gesture:** Browsers block autoplay. User must click/key/touch once; `onUserInteract()` calls `unlockAudio()`. If nebula is already selected, `unlockAudio()` re-calls `setNebulaAudio(true)` after the graph is built.

## Bundler wrapper — read this before editing

`index.html` is **not a normal HTML file**. All real shader/UI/CSS/JS lives inside the JSON-encoded `<script type="__bundler/template">` string.

1. `__bundler/manifest`, `__bundler/ext_resources`, and `__bundler/template` hold assets and the inner HTML document.
2. On `DOMContentLoaded`, the wrapper unpacks, substitutes UUIDs, then `replaceWith()` the inner document.
3. Edits must preserve JSON escaping: newlines as `\n`, quotes as `\"`, **`</` as `<\u002F`** (critical — literal `</script>` inside the JSON truncates the outer HTML parser).

### Safe edit workflow

**Prefer** decode → patch → encode with a script, not raw `StrReplace` on the one-line JSON:

```python
import json
from pathlib import Path

text = Path("index.html").read_text()
start = text.index('<script type="__bundler/template">') + len('<script type="__bundler/template">')
end = text.rindex('</script>')  # LAST </script> — not the first (inner template has <\u002Fscript>)
tpl = json.loads(text[start:end].strip())

# … patch tpl …

raw = json.dumps(tpl, ensure_ascii=False).replace('</', r'<\u002F')
json.loads(raw)  # verify
Path("index.html").write_text(text[:start] + raw + text[end:])
```

**Never** use a non-greedy regex `(.*?)</script>` on the whole file — it matches the first inner `</script>` and corrupts the template.

When using `Edit` on the raw file, match JSON escapes intact (e.g. `<\u002Fspan>`). `grep` collapses to one line — use `grep -oE 'pattern.{0,200}'` or the Python extract above.

### Backups

- `index_sauve.html` — older snapshot; **missing** gamepad + nebula audio. Do not restore from it without re-merging those features.
- Git `HEAD` commit `7a8d059` has gamepad; current working tree adds dock/HUD/audio on top.

## Why livereload.js fails here

`document.documentElement.replaceWith()` detaches scripts mid-init, leaving `LiveReload.reloader` undefined → `addPlugin` throws. The page opens its own WebSocket to `ws://localhost:35729/livereload` and reloads on `reload`. **Don't replace this with a `<script src=".../livereload.js">` tag.**

Disable the LiveReload browser extension on this origin (it injects `livereload.js?port=35729` and causes the same error). The inline WS handler is sufficient.

## Local dev

```bash
python3 -m http.server 8000              # serve files — use http:// not file://
livereload . -p 35729                    # file watcher → WebSocket reload signal
# open http://localhost:8000/
```

Both run as background processes. `livereload` is the npm package (`/Users/aurelienfache/.local/bin/livereload`), Python-based, watches CWD.

After template edits, hard-refresh (**Cmd+Shift+R**) if the browser cached a broken unpack.

## Recording

- `record.mjs` — deterministic WebGL frame capture → ffmpeg (shader video, no audio tap).
- `record-page.mjs` — DOM + Web Audio capture via `AudioContext` monkey-patch; use for clips that include nebula sound.

## Repo context

This directory lives inside `mathemagie.github.io` (GitHub Pages). Parent `package.json` tooling does not apply here — no lint, no tests, no build step. Treat `bidouille/shader/` as a self-contained sketch.

Sibling `bidouille/` folders are independent; don't import from them.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Sphere + `Error unpacking: Unterminated string in JSON` | Corrupted `__bundler/template` (truncated at inner `</script>`) |
| Dock/HUD missing | Unpack failed; still on outer shell |
| Gamepad dead | `pollGamepad` not called in `frame()`, or restored from `index_sauve.html` |
| No sound on nebula | No user click yet (autoplay policy), or not on nebula shader |
| `addPlugin` / livereload console error | LiveReload browser extension — disable for localhost |
