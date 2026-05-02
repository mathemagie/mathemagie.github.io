# CLAUDE.md — rotary_phone

Static, no-build interactive page: a CSS-only Socotel S63 (orange French
PTT rotary phone) that dials `06 20 83 88 25` to open an "alien call"
overlay with a Web Audio waveform.

## Files

- `index.html` — markup, loads CSS+JS with `?v=<hash>` cache busters.
- `css/styles.css` — all visuals (no images): body, dial, handset, desk
  surface, overlay. Pure gradients/box-shadows.
- `js/script.js` — dial rotation, DTMF tones, dial-return click, overlay
  scope/subtitles. Vanilla JS, no framework.

## Run locally

```sh
python3 -m http.server 8765
# open http://localhost:8765/
```

## Cache busting (mandatory)

Per `../../agent.md`, every CSS/JS edit must bump the `?v=<8-char>` hash
in `index.html`:

```sh
shasum -a 1 css/styles.css js/script.js
```

Update both `<link>` and `<script>` tags accordingly in the same commit.

## Design direction

The phone is modelled on this Wikimedia reference (orange Socotel S63):
<https://commons.wikimedia.org/wiki/File:Ancien_t%C3%A9l%C3%A9phone_%C3%A0_disque_rotatif.jpg>

Locked-in design choices — change only if the user asks:
- **PTT orange** body, ivory dial back-plate, chrome bezel.
- **Counterclockwise** digit layout: `1` upper-right → `2` top → `3`
  upper-left → … → `0` right. The angle formula is
  `--angle: calc(-60deg - var(--i) * 30deg)` on `.num` and `.hole`.
- French letter triplets next to each digit (2 ABC, 3 DEF, 4 GHI, 5 JKL,
  6 MN, 7 PRS, 8 TUV, 9 WXY, 0 OPÉR.).
- Center card is `URGENCES` (POMPIERS 18 / POLICE 17 / SAMU 15).
- The phone sits on a wooden desk with contact shadow + `rotateX(8deg)`
  perspective. Don't make it float again.

## Dial mechanics — don't break

- Each `.hole` button has `data-digit` (0–9). JS ignores visual position
  and rotates the dial CW by `digit * 30deg` (10×30° for 0).
- The visual layout can change freely as long as `1` sits closest CW to
  the finger-stop and `0` farthest. The finger-stop SVG is at
  `top:0; right:4%; rotate(36deg)` of `.dial-housing`.
- Don't add transitions to `.dial` outside the existing `.spinning` /
  `.returning` classes — they tune the windup / return curves.

## Editing tips

- Keep changes CSS-only when possible; the markup carries
  semantic/accessibility intent (`aria-label`s, `data-digit`, `--i`).
- The starfield, alien-call overlay, and waveform are part of the
  experience — leave them intact.
- Mobile breakpoint lives at the bottom of `styles.css`
  (`@media (max-width: 480px)`).

## Iterating on visuals

Useful loop when matching a reference photo:
1. Start `python3 -m http.server 8765` in the background.
2. Take a Playwright screenshot at 480×820.
3. Compare to the reference, list 2–3 most impactful gaps.
4. Edit CSS, bump cache hash, reload, repeat.
