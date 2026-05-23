# game.md — Gamepad support for 3615 TERRE

How to enrich 3615 TERRE when a **game controller is connected**.
Reference: [MDN — Using the Gamepad API](https://developer.mozilla.org/fr/docs/Web/API/Gamepad_API/Using_the_Gamepad_API).

## Constraints (from AGENTS.md + CLAUDE.md)

- **Never spoil the location.** Haptics may track *audio loudness*, never
  *distance to the place* or anything that hints at the answer.
- **All controller-related UI text is English** (e.g. `CONTROLLER CONNECTED`).
- Reveal stays opt-in — same rule as the `H` key.

---

## 1. Detect "controller is ON"

The Gamepad API is event-based for connect/disconnect, then **polled** for
state. Firefox/Chrome only expose pads after a first user interaction.

```javascript
let activePad = null;

window.addEventListener('gamepadconnected', (e) => {
  activePad = e.gamepad.index;
  // English-only, no location info:
  setStatus('CONTROLLER CONNECTED');
});

window.addEventListener('gamepaddisconnected', () => {
  activePad = null;
});

function getPad() {
  if (activePad == null) return null;
  return navigator.getGamepads()[activePad] || null;
}
```

When `getPad()` returns a pad, controller mode is ON — show a small
controller glyph in the UI and enable the suggestions below.

---

## 2. Map buttons to the existing keyboard actions

Current keys: `H` reveal · `F` fullscreen · `I` info · `M` mute.
Standard mapping (`gamepad.mapping === "standard"`):

| Control | Index | Suggested action in 3615 TERRE |
|---|---|---|
| **A** (south) | `buttons[0]` | Reveal location (= `H`) — the game spoiler, opt-in |
| **B** (east) | `buttons[1]` | Close panels / exit reveal (= `Escape`) |
| **X** (west) | `buttons[2]` | Toggle mute (= `M`) |
| **Y** (north) | `buttons[3]` | Toggle info panel (= `I`) |
| **Start** | `buttons[9]` | Toggle fullscreen (= `F`) |
| **D-pad ↑ / ↓** | `buttons[12/13]` | Volume up / down |
| **Left stick X** | `axes[0]` | Scrub volume (analog) |
| **LT / RT** | `buttons[6/7]` | Analog volume (use `.value`, 0..1) |

Buttons must be **edge-detected** (fire once per press), since polling sees
the button held down across many frames.

```javascript
const prev = {};                       // last frame's pressed state
function edgePressed(pad, i) {
  const now = pad.buttons[i]?.pressed ?? false;
  const fired = now && !prev[i];
  prev[i] = now;
  return fired;
}

function pollPad() {
  const pad = getPad();
  if (pad) {
    if (edgePressed(pad, 0)) toggleReveal();   // A
    if (edgePressed(pad, 2)) toggleMute();     // X
    if (edgePressed(pad, 3)) toggleInfo();     // Y
    if (edgePressed(pad, 9)) toggleFullscreen();// Start
    // Analog volume from a trigger (continuous, no edge):
    const rt = pad.buttons[7]?.value ?? 0;
    if (rt > 0.05) setVolume(rt);
  }
  requestAnimationFrame(pollPad);
}
requestAnimationFrame(pollPad);
```

Reuse the existing `visualize()` rAF loop instead of a second loop if you
prefer one tick per frame.

---

## 3. Haptic feedback (the signature feature)

`gamepad.vibrationActuator.playEffect("dual-rumble", {...})` —
`strongMagnitude` = low-freq motor, `weakMagnitude` = high-freq buzz, both 0..1.

```javascript
function hapticPulse(strong = 0.6, weak = 0.3, duration = 150) {
  const pad = getPad();
  pad?.vibrationActuator?.playEffect?.('dual-rumble',
    { duration, strongMagnitude: strong, weakMagnitude: weak });
  if (!pad) navigator.vibrate?.(duration);   // phone fallback (not iOS Safari)
}
```

### Suggested haptic moments

| Moment | Effect | Why |
|---|---|---|
| **Ambient audio** (the `barLevel` VU value) | continuous rumble scaled to level | *feel* the soundscape — allowed, it's loudness not location |
| Connection established (`connectionStep → 2`) | one firm pulse | "locked on the ISS" |
| New track / location starts | short double-tap | a new place to guess |
| Reveal (A / `H`) | sharp confirmation buzz | acknowledges the spoiler |
| Mute toggle | tiny tick | tactile confirm |

### Continuous ambient rumble

`dual-rumble` effects expire after `duration` — re-arm slightly *before* they
end so the rumble stays smooth. Throttle to ~90 ms with a 120 ms effect:

```javascript
let lastRumble = 0;
function hapticAmbient(level) {            // call inside visualize(barLevel)
  const pad = getPad();
  if (!pad?.vibrationActuator) return;
  const now = performance.now();
  if (now - lastRumble < 90) return;
  lastRumble = now;
  pad.vibrationActuator.playEffect('dual-rumble', {
    duration: 120,
    weakMagnitude:  Math.min(1, level * 0.9),
    strongMagnitude:Math.min(1, level * 0.4),
  });
}
```

---

## 4. Gotchas

- **User gesture first** — vibration usually needs a prior button press before
  it fires.
- **Re-arm continuous effects** before `duration` expires (the 90 ms throttle).
- **Support is uneven** — `vibrationActuator` is solid in Chromium, partial in
  Firefox; iOS Safari has neither gamepad rumble nor `navigator.vibrate`.
  Always feature-detect (`?.`), never assume.
- **Standard mapping only** — guard with `pad.mapping === 'standard'` before
  trusting the index table; non-standard pads need their own map.
- **Don't spoil** — keep every haptic tied to sound/UI events, never to where
  the ISS actually is.
