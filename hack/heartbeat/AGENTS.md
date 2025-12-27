# Repository Guidelines

## Project Structure & Module Organization
The project is a static p5.js experience served from `index.html`. Front-end styles live in `css/styles.css`, while all dynamic animation, sensor hooks, and theme logic sit in `js/script.js`. Touch icons, manifest metadata, and analytics integrations are referenced from the repo root, so keep filenames stable when swapping assets to avoid 404s.

## Build, Test, and Development Commands
Use `python3 -m http.server 5173` from the repository root for a quick local preview; this mirrors the GitHub Pages hosting path. For iterative work, launch the server and reload the browser to confirm animation changes, or toggle dev tools throttling to simulate slower devices. When modifying icons or the manifest, revisit the served page with `?cacheBust=<timestamp>` to bypass CDN caches.

## Coding Style & Naming Conventions
Maintain two-space indentation in HTML, CSS, and JavaScript as seen across the existing files. Favor `const` and `let` with descriptive camelCase identifiers in `js/script.js`; align new functions with the p5.js lifecycle (`setup`, `draw`, interaction handlers). CSS selectors should stay kebab-case, and new utility classes belong near related blocks with comments clarifying intent.

## Testing Guidelines
There is no automated test harness; perform manual verification in modern desktop browsers and iOS Safari to cover the sensor pathways. Validate that particle counts, heartbeat toggles (`H` key), and touch gestures behave as described in the UI copy. When adjusting themes, confirm transitions for at least two cycles and watch console output for resize logs to catch layout regressions.

## Commit & Pull Request Guidelines
Keep commits scoped and message them in lower-case imperative style (`add heartbeat intensity slider`), matching the existing history. Before opening a pull request, summarize the change, list manual test evidence, and link any GitHub issue or design brief that drove the work. Include screenshots or short screen recordings whenever UI or animation timing changes are involved.
