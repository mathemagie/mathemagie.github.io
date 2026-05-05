---
name: laws-of-simplicity
description: Use when designing, auditing, refactoring, or simplifying any UI / UX / product / codebase / writeup — when the user says "simplify this", "make it cleaner", "feels too busy", "remove clutter", or asks how to improve a screen / page / interface / API. Applies John Maeda's 10 Laws of Simplicity + 3 Keys as a concrete checklist with real-world subtraction tactics.
---

# Laws of Simplicity (John Maeda)

## Overview

A reference for applying John Maeda's *Laws of Simplicity* (MIT Press, 2006) to design and product work. Maeda's central insight: **"Simplicity is about subtracting the obvious, and adding the meaningful."**

Use this skill BEFORE proposing simplifications so you don't just subtract decoration — you also surface meaning. Use it AFTER a refactor to audit gaps.

## When to Use

- User asks to "simplify", "clean up", "reduce", or "improve" any interface
- A screen has been progressively decluttered and you need to know what to do next
- You're tempted to subtract everything — this skill stops you from over-stripping
- You're tempted to add a feature — this skill forces you to consider subtraction first
- Auditing a finished design before shipping
- Comparing two design alternatives

**Do NOT use for:** Pure performance/code refactors with no UX surface, or technical-debt cleanup.

## The 10 Laws + 3 Keys

| # | Law | One-line meaning | Concrete tactic |
|---|-----|------------------|-----------------|
| 1 | **Reduce** | Thoughtful subtraction is the simplest path. | SHE: **Shrink, Hide, Embody** — make small, hide secondary, make remaining feel premium. |
| 2 | **Organize** | A system of many appears as fewer when grouped. | SLIP: **Sort, Label, Integrate, Prioritize** — chunk related items into one visual unit. |
| 3 | **Time** | Time savings feel like simplicity. | Show progress, cache state, skip flows for return users, defer non-critical work. |
| 4 | **Learn** | Knowledge makes things simpler. | One-line tooltips, progressive disclosure, name things after what they do. |
| 5 | **Differences** | Simplicity needs complexity to contrast against. | Don't strip everything — keep one rich element so the minimal parts read as intentional. |
| 6 | **Context** | The periphery is not peripheral. | Empty space, background, the corners — they frame meaning. Don't ignore them. |
| 7 | **Emotion** | More emotion is better. | Texture, motion, sound, micro-delight — gives soulless minimalism a heartbeat. |
| 8 | **Trust** | We trust the simple. | Sensible defaults, visible status, undo, no surprises, no silent failures. |
| 9 | **Failure** | Some things can't be made simple. | Accept and hide essential complexity rather than faking it away. |
| 10 | **The One** | Subtract the obvious, add the meaningful. | The single most-quoted law. After every subtraction, ask: *what meaningful thing should I add?* |
| K1 | **Away** | More appears like less by moving it far away. | Push utilities to edges/corners, hide settings behind a tap, demote the brand to a watermark. |
| K2 | **Open** | Openness simplifies complexity. | Open-source, link to source, expose data, link to upstream projects. |
| K3 | **Power** | Use less, gain more. | Save battery/data/attention. Pause loops on hidden tabs, lazy-load fonts, respect `prefers-reduced-motion`. |

## Application Workflow

When the user asks to simplify a screen:

1. **Audit, don't act yet.** Walk through each law and identify which ones the screen violates AND which it already satisfies. Skip laws that don't apply.
2. **Rank by leverage.** Most simplification gains concentrate in 2-4 laws, not all 10. Common high-leverage: #1 Reduce, #6 Context, #8 Trust, #10 The One.
3. **Pair Reduce with The One.** For every subtraction proposed, name what *meaningful* thing should be surfaced. Pure subtraction without addition risks emptying meaning.
4. **Present a table to the user.** Format: Law | Gap | Concrete fix. Let them pick which to implement. Don't do all of them.
5. **Re-audit after.** A refactor often unlocks a *new* set of violations that weren't visible before.

## The "Subtract the Obvious / Add the Meaningful" Test

Before any change, ask both halves of Law #10:

- **What's obvious here that should be subtracted?** Decorative chrome, redundant labels, dead controls, fake animations, generic icons, unused fields.
- **What's meaningful here that should be added/surfaced?** The actual data being thrown away (location, status, source), the relationship between elements, the one detail that gives this thing identity.

A simplification that only does the first half produces emptiness. The second half is the soul.

## Concrete Subtraction Tactics (Reduce + Away)

| Tactic | Example |
|--------|---------|
| Replace generic icons with line-art that matches the visual system | Emoji 🔊 → cyan SVG speaker |
| Drop labels that the icon already communicates | "VOL" label next to a speaker icon |
| Merge two visualizations of related data into one | Audio bars + signal-strength bar → bars whose color encodes both |
| Demote the brand/title to a corner watermark | "3615 TERRE" headline → 1.4rem top-left mark |
| Anchor utility controls to the screen edge | Center "controls" → fixed bottom bar |
| Hide a control when its action isn't applicable | Fullscreen toggle hides while in fullscreen |

## Concrete "Add the Meaningful" Tactics

| Tactic | Example |
|--------|---------|
| Surface the data the system already computes but throws away | Geocoded city name, distance to source, ISS coordinates |
| Show progress / status during invisible work | "Connexion à [lieu]…" before audio starts |
| Make the brand mark explain itself on hover | Watermark links to the source project + reveals "what is this?" |
| Add ambient atmosphere that ties to the theme | Drifting starfield + cyan-tinted noise grain in a "space" app |
| Make returning visitors skip the intro | localStorage flag → skip overlay on revisit |

## Common Mistakes

- **Stripping until empty.** Subtraction without #10 (add the meaningful) creates a beautiful but lifeless screen. Always pair.
- **Treating all 10 laws as equal weight.** They're not — for any given screen, 2-4 dominate. Identify those first.
- **Ignoring #5 Differences.** A screen that's *uniformly* minimal feels flat. Keep one richer element (the bars, the hero image, a single accent color) so minimalism reads as a choice.
- **Mistaking "fewer pixels" for "simpler".** A dense data table can be simpler than a sparse 4-step wizard if it eliminates clicks. Time (#3) often beats Reduce (#1).
- **Skipping the audit table.** Going straight to "I'll redesign" loses leverage. Show the user a Law-by-Law gap table first; let them pick.

## Quick-Reference Audit Template

When asked "how can I simplify this?", reply with this shape:

```
| Law | Gap in current design | Concrete fix |
|-----|----------------------|--------------|
| #X  | [what's wrong now]   | [the move]   |
| #Y  | ...                  | ...          |

Recommend [N] highest-leverage items: X + Y together address [trade-off].
Want me to implement those, or pick a different combo?
```

This puts the user in control, prevents over-engineering, and forces you to think in laws rather than vibes.

## Sources

- John Maeda, *The Laws of Simplicity*, MIT Press, 2006 — https://lawsofsimplicity.com/
- Free PDF: https://designopendata.files.wordpress.com/2014/05/lawsofsimplicity_johnmaeda.pdf
