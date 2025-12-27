# Lava Lamp Thermal Visualizer

An experimental WebGL2 sketch that simulates the gooey motion of a retro lava lamp.  
Everything lives in a single `index.html` that packs custom shaders, animated UI, and hidden debug controls.

## Project Structure

```
lavalamp/
├── index.html   # All markup, styles, WebGL shaders, and controls
└── CLAUDE.md    # Notes/ideas for future iterations
```

## Prerequisites

| Tool | Why you need it | Install tip |
| --- | --- | --- |
| Node.js + npm | Gives you `npx`, which we use to launch LiveReload without touching package.json | https://nodejs.org/en/download |
| A modern browser | WebGL2 support (Chrome, Firefox, Safari TP, Edge) | Update to the latest stable version |

> Already have Node.js? You can skip straight to the **LiveReload launch** step below.

## Launch with LiveReload (recommended)

1. **Open a terminal and move into the project folder**
   ```bash
   cd /Users/aurelienfache/Documents/GitHub/mathemagie.github.io/hack/lavalamp
   ```
2. **Start a zero-config dev server that auto-refreshes when you save**
   ```bash
   npx live-server --port=4173 --open=index.html
   ```
   - `npx live-server` downloads the tool on the fly (no global install needed).
   - `--port=4173` avoids conflicts with other projects; change it if already in use.
   - `--open=index.html` launches your default browser at the correct file.
3. **Develop with instant feedback**
   - Each time you save `index.html`, LiveReload triggers a refresh.
   - Watch the terminal for logs (errors will appear there).

### Optional: Global install

If you prefer a global command:
```bash
npm install --global live-server
live-server --port=4173 --open=index.html
```

### Without LiveReload

You can still view the sketch by serving the folder manually (no auto-refresh):
```bash
python3 -m http.server 4173
# In your browser, visit http://localhost:4173/index.html
```

## Debug controls & shortcuts

| Action | How to use it |
| --- | --- |
| Toggle control panel | Press `H` |
| Force controls to appear on page load | Append `?debug=1` to the URL |
| Adjust look & feel | Use sliders for blob count, speed, viscosity, size, light intensity |
| Recolor the simulation | Use the color pickers for blob spectrum & liquid base |
| See performance | FPS counter updates in the lower-left corner |

Tip: On touch devices or narrow windows, the shader automatically tightens the blob motion so everything stays visible. Resize the window to experiment.

## Troubleshooting

- **Blank screen or alert**: Your browser might not support WebGL2. Update your browser or enable hardware acceleration.
- **Server port already used**: Pick another port (`--port=5000`) and reload.
- **Controls missing**: Use `H` or add `?debug=1` to reveal them.
- **Slow performance**: Drop the blob count or speed sliders; fewer blobs mean fewer shader calculations.

## Next steps

Ideas if you want to keep hacking:

- Extract shaders into separate `.glsl` files and introduce a bundler (Vite, Parcel) for cleaner organization.
- Add presets (e.g., “Calm Drift”, “Supernova”) so you can jump to favorite looks.
- Wire up localStorage to remember your last slider values.
- Bundle with Web Workers to experiment with GPU/CPU hybrids or shader warm-up.

Have fun exploring the thermal goo! If you get stuck, open an issue or keep notes in `CLAUDE.md`.***

