## UX Backlog — 25544.fm (ISS Orbital Radio)

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

8. [x] Smooth crossfade between stations
   - 300–600 ms volume crossfade on region switch (two <audio> elements or a gain envelope).
   - Fail-safe: instant switch if crossfade fails.
   - ✅ Implemented: 400ms crossfade using dual audio elements with volume fade and fail-safe instant switching.

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

16. [ ] Particle density adaptive scaling
    - Automatically reduce particle count based on device performance/battery level.
    - Monitor frame rate and dynamically adjust particle count to maintain 60fps target.

17. [ ] Smooth zoom & pan interactions
    - Mouse wheel/pinch to zoom into specific regions, drag to pan around Earth.
    - Smooth interpolated transitions with momentum-based easing.

18. [ ] Particle trail effects
    - Optional comet trails for moving particles that fade over time.
    - Configurable trail length and opacity; disable with reduced motion preference.

19. [ ] Day/night Earth visualization
    - Subtle shading to show current day/night terminator line based on real solar position.
    - Dimmer particles in nighttime regions, brighter in daylight areas.

20. [ ] ISS orbital path preview
    - Show faint dotted line of upcoming ISS trajectory (next 30-60 minutes).
    - Color-coded path segments indicating upcoming regional transitions.

21. [ ] Volume persistence
    - Remember user's preferred volume level across sessions in localStorage.
    - Smooth volume restoration on page load without audio interruption.

22. [ ] Audio spectrum visualizer
    - Subtle particle color/size modulation based on audio frequency data using Web Audio API.
    - Real-time analysis with low-pass filtering to avoid jarring visual changes.

23. [ ] Station history/favorites
    - Quick access panel showing recently played or user-bookmarked stations.
    - Persistent favorites list with manual station switching capability.

24. [ ] Custom station addition
    - Allow users to add their own radio stream URLs with validation.
    - Support for common formats (MP3, AAC, OGG) with error handling.

25. [ ] Radio quality selection
    - Choose between low/medium/high bitrate streams based on connection quality.
    - Automatic quality adaptation based on detected bandwidth and buffering events.

26. [ ] Touch gestures on mobile
    - Pinch-to-zoom, double-tap regions to focus, swipe for manual station switching.
    - Haptic feedback integration where supported for tactile confirmation.

27. [ ] Particle interaction modes
    - Click/tap particles to create ripple effects or temporary gravitational pulls.
    - Interactive physics playground mode with particle spawning and manipulation.

28. [ ] Region preview
    - Hover over continent clusters to preview that region's radio station info.
    - Non-intrusive tooltip showing station name, genre, and country without switching.

29. [ ] Share current view
    - Generate shareable links with current ISS position, timestamp, and selected preferences.
    - Social media integration with auto-generated descriptions and preview images.

30. [ ] Screenshot/recording
    - Capture current visualization as high-resolution image or short MP4 video.
    - Export options with customizable duration and quality settings.

31. [ ] High contrast mode
    - Alternative color palette optimized for users with visual impairments.
    - Enhanced borders, larger UI elements, and improved text contrast ratios.

32. [ ] Particle size scaling
    - User preference slider for larger/smaller particles (0.5x to 2x scaling).
    - Maintains visual hierarchy while accommodating different vision needs.

33. [ ] Color blind friendly mode
    - Alternative colors and patterns that work for deuteranopia, protanopia, tritanopia.
    - Shape-based differentiation in addition to color coding for regions.

34. [ ] Keyboard navigation
    - Full keyboard control for all UI elements with visible focus indicators.
    - WASD/arrow keys for view navigation, spacebar for play/pause, number keys for regions.

35. [ ] Voice announcements
    - Optional screen reader and audio cues for region changes and station information.
    - Configurable verbosity level and voice selection using Web Speech API.

---

Notes
- Keep all overlays and toasts minimal, non-blocking, and auto-dismissing.
- Persist user choices (e.g., auto-switch lock, outlines toggle) in localStorage.
- Validate touch targets and contrast ratios (WCAG AA minimum).