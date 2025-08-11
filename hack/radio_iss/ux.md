## UX Backlog — Radio ISS

Below is a numbered, actionable list of UX improvements. Each item is scoped to be independently shippable.

1. [ ] Onboarding hint
   - Brief, auto-fading tooltip on first load: “Press P to play/pause, F fullscreen, M outlines. Tap ⛶ on mobile.”
   - Auto-hide after 6–8s or on any interaction.

2. [ ] Help overlay (shortcut `?`)
   - Press `?` to open a lightweight overlay listing shortcuts and toggles; tap/click outside or press `Esc` to dismiss.
   - Include: P play/pause, F fullscreen, M outlines, ? help; show mobile equivalents.

3. [ ] Region switch toast
   - Non-blocking toast bottom-left on station change: “Over Brazil — SomaFM Bossa Beyond”.
   - Auto-dismiss in 3–4s; respects reduced motion.

4. [ ] Station pill with identity
   - Replace plain text with a compact pill showing station favicon/logo + region emoji/flag + name.
   - Ensure legibility on dark background; truncate gracefully on small screens.

5. [ ] Playback affordance & placement
   - Larger hit area (≥44px) for play/pause; bottom-center placement on mobile.
   - Auto-hide controls after 3s of inactivity; reappear on tap/move.

6. [ ] Buffering/connecting feedback
   - Tiny inline spinner next to station pill while connecting or retrying.
   - Provide a subtle “Retry” action if the stream stalls.

7. [ ] Auto-switch lock
   - Toggle to temporarily “Lock station” (e.g., 10 minutes) to avoid surprise switches.
   - Toast shows remaining time and a “Resume auto” action.

8. [ ] Smooth crossfade between stations
   - 300–600 ms volume crossfade on region switch (two <audio> elements or a gain envelope).
   - Fail-safe: instant switch if crossfade fails.

9. [ ] Accessibility & preferences
   - Visible focus outlines and ARIA labels for all controls.
   - Honor “prefers-reduced-motion” by toning down particle pulses and transitions.
   - Ensure screen reader-friendly labels: now playing, region, status.

10. [ ] Mobile safe-area awareness
    - Respect notches and home indicators via CSS env(safe-area-inset-*).
    - Keep controls clear of edges and ensure comfortable reach.

11. [x] ISS context mini-overlay
    - Optional compact overlay with current lat/lon, current region, next region ETA, and a path-trace toggle.
    - Toggle from help overlay and remember user preference.
    - ✅ Implemented: Press 'I' to toggle ISS context overlay with real-time position data, region info, ETA estimation, and path trace toggle. Preferences saved to localStorage.

12. [ ] Discoverability of outlines (M)
    - When ‘M’ is pressed the first time, briefly label continent groups (“Europe”, “Oceania”) and fade labels.

13. [ ] Audio-reactive ISS pulse (subtle)
    - Modulate ISS pulse intensity slightly with audio amplitude for perceived synchrony.
    - Clamp to subtle range; disable if reduced motion is on.

14. [ ] Palette semantics
    - Cohesive color mapping per continent cluster; reserve red exclusively for ISS to maintain salience.

15. [ ] Stream resilience
    - Graceful error state for offline/stream errors; exponential backoff auto-retry.
    - Offer alternate mirror/source when available.

---

Notes
- Keep all overlays and toasts minimal, non-blocking, and auto-dismissing.
- Persist user choices (e.g., auto-switch lock, outlines toggle) in localStorage.
- Validate touch targets and contrast ratios (WCAG AA minimum).