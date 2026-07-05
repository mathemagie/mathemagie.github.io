---
name: laws-of-simplicity
description: Use when designing, auditing, refactoring, or simplifying any UI / UX / product / codebase / writeup — when the user says "simplify this", "make it cleaner", "feels too busy", "remove clutter", or asks how to improve a screen / page / interface / API. Applies John Maeda's 10 Laws of Simplicity + 3 Keys as a concrete checklist with real-world subtraction tactics, including the canonical tradeoff questions, mnemonics (SHE, SLIP, BRAIN, RELATE-TRANSLATE-SURPRISE), and the lean-back vs. undo paths to trust.
---

# Laws of Simplicity (John Maeda)

## Overview

A reference for applying John Maeda's *Laws of Simplicity* (MIT Press, 2006) to design and product work. Maeda's central insight, **Law 10 / THE ONE**:

> **"Simplicity is about subtracting the obvious, and adding the meaningful."**

Apply this skill BEFORE proposing simplifications so you don't just subtract decoration — you also surface meaning. Apply it AFTER a refactor to audit gaps.

For Maeda's own framing of any specific law, original quotes, or deeper context, load `references/book-source.md` — it contains curated passages straight from the book.

## Three Clusters (Maeda's structure)

The 10 Laws come in three flavors of increasing subtlety, plus the summary:

- **Basic simplicity (1–3)** — Reduce, Organize, Time. Apply to any product, screen, or room.
- **Intermediate simplicity (4–6)** — Learn, Differences, Context. Subtler.
- **Deep simplicity (7–9)** — Emotion, Trust, Failure. The hardest.
- **Law 10 (The One)** — sums up all of it.
- **Three Keys (Away, Open, Power)** — technology-domain markers, not laws but fellow travelers.

## When to Use

- User asks to "simplify", "clean up", "reduce", or "improve" any interface
- A screen has been progressively decluttered and you need to know what to do next
- You're tempted to subtract everything — this skill stops you from over-stripping
- You're tempted to add a feature — this skill forces you to consider subtraction first
- Auditing a finished design before shipping
- Comparing two design alternatives

**Do NOT use for:** Pure performance/code refactors with no UX surface, or technical-debt cleanup.

## The 10 Laws + 3 Keys at a Glance

| # | Law | Maeda's one-line | Memorable handle |
|---|-----|------------------|------------------|
| 1 | **REDUCE** | The simplest way to achieve simplicity is through thoughtful reduction. | **SHE: Shrink, Hide, Embody** |
| 2 | **ORGANIZE** | Organization makes a system of many appear fewer. | **SLIP: Sort, Label, Integrate, Prioritize** |
| 3 | **TIME** | Savings in time feel like simplicity. | Shrink the wait OR hide it (progress bars, free cookies in line) |
| 4 | **LEARN** | Knowledge makes everything simpler. | **BRAIN** + **RELATE-TRANSLATE-SURPRISE** |
| 5 | **DIFFERENCES** | Simplicity and complexity need each other. | Rhythm: "*taa taa ti ti taa*" not "*taa taa taa taa*" |
| 6 | **CONTEXT** | What lies in the periphery of simplicity is definitely not peripheral. | "Nothing is something." Light bulb, not laser beam. |
| 7 | **EMOTION** | More emotions are better than less. | **Feeling follows form.** Aichaku. ROE. |
| 8 | **TRUST** | In simplicity we trust. | **Lean back** (Master) OR **Undo** (no Master) |
| 9 | **FAILURE** | Some things can never be made simple. | **ROF** — Return on Failure |
| 10 | **THE ONE** | Simplicity is about subtracting the obvious, and adding the meaningful. | The one law to remember. |
| K1 | **AWAY** | More appears like less by simply moving it far, far away. | SaaS, cloud, hosted APIs |
| K2 | **OPEN** | Openness simplifies complexity. | Open-source, public APIs |
| K3 | **POWER** | Use less, gain more. | Battery, attention, electricity |

## Maeda's Five Tradeoff Questions

Each of these is the live tension at the heart of a law. Use them verbatim when framing a design decision.

| Law | The tradeoff |
|-----|--------------|
| 1 REDUCE | **How simple can you make it? ↔ How complex does it have to be?** |
| 3 TIME | **How can you make the wait shorter? ↔ How can you make the wait more tolerable?** |
| 6 CONTEXT | **How directed can I stand to feel? ↔ How directionless can I afford to be?** |
| 8 TRUST | **How much do you need to know about a system? ↔ How much does the system know about you?** |
| 7 EMOTION | (implicit) **Form follows function ↔ Feeling follows form.** |

These tradeoffs are *better than rules* — they give the user agency over which side of a real tension to favor.

## Concrete Tactics by Law

### Law 1 — REDUCE (use SHE)

- **SHRINK** — make the object small, light, thin. Smaller objects earn forgiveness when they misbehave.
- **HIDE** — bury complexity behind menus, doors, click-to-reveal. Make the hiding feel like *magic*, not deceit.
- **EMBODY** — when shrinking and hiding strip too much, restore perceived/actual quality (B&O makes their remote heavier than expected to communicate value; sometimes you must violate HIDE — "3 CCDs" sticker — to advertise hidden quality).

> "Lessen what you can and conceal everything else without losing the sense of inherent value."

### Law 2 — ORGANIZE (use SLIP)

1. **SORT** — write each item on a post-it; group physically.
2. **LABEL** — name each group; if no name fits, use a code (letter/number/color).
3. **INTEGRATE** — merge groups that look alike. Fewer is better.
4. **PRIORITIZE** — Pareto 80/20: pick the vital 20% to focus on.

> "Squint at the world. You will see more, by seeing less." Best designers squint to find the gestalt.

### Law 3 — TIME

Two paths:
- **Shrink time**: actually make it faster (FedEx, RFID, removing the choice itself like iPod Shuffle).
- **Hide/embody time**: progress bars (smooth fills feel faster than chunky steps — Apple's own user research), countdown timers, free cookies in the Whole Foods queue, casino without windows or clocks.

> "Knowledge is comfort, and comfort lies at the heart of simplicity."

### Law 4 — LEARN (use BRAIN + RELATE-TRANSLATE-SURPRISE)

**BRAIN** — for teaching anything:
- **B**asics are the beginning.
- **R**epeat yourself often.
- **A**void creating desperation. ("Wow" easily becomes "woah.")
- **I**nspire with examples.
- **N**ever forget to repeat yourself.

**RELATE-TRANSLATE-SURPRISE** — for designing intuitive UI:
- **Relate** to something the user already knows (desktop metaphor).
- **Translate** the relationship into your new context.
- **Surprise** with an unexpected payoff that justifies the leap (digital files can do things physical ones can't).

### Law 5 — DIFFERENCES

Keep one element rich so the minimal parts read as intentional. Aim for *rhythm*: simplicity, complexity, simplicity, complexity. Pure unrelenting minimalism is as monotonous as pure clutter.

### Law 6 — CONTEXT

**Nothing is something.** White space, ambience, the periphery — they are not absence. They frame meaning.
- "Comfortably lost" — let users feel directionless enough to explore but found enough to not panic. Trail markers that pop into focus when needed, recede otherwise.
- Negroponte: be a light bulb, not a laser beam.

### Law 7 — EMOTION

**"Feel, and feel for."** Start by being aware of your own feelings, then empathize with the user.

> **"Form follows function" gives way to "Feeling follows form."**

- **Aichaku (愛着)** — "love-fit." A deep attachment to an object for what it *is*, not what it does.
- **Nude electronics + accessories** — phones get cold and skinny (SHE-d); accessories warm them back up. Lets users express feelings *for* their objects.
- **ROE — Return on Emotion.** "A certain kind of more is always better than less—more care, more love, and more meaningful actions."

### Law 8 — TRUST

Two opposite paths produce simplicity:

- **LEAN BACK** — surrender to a Master. B&O makes you trust their stereo. Sushi *omakase* — "I leave it up to you." Demands trust paid back consistently. The deeper, more vulnerable path.
- **UNDO** — convenience without trust. Returnable purchases, Cmd-Z, gift receipts. No Master needed. "Power is equally balanced between experience and user." But: "put the UNDO button away when dealing with real people."

### Law 9 — FAILURE

> "There's an ROF (Return On Failure) when you try to simplify—which is to learn from your mistakes."

Some things resist simplification. Ship anyway and accept the flaws — Maeda's own book lists its flaws ("acronym overload", "bad gestalts", "too many laws").

### Law 10 — THE ONE

The one to keep. *Subtract the obvious, add the meaningful.* Coach Ellisalde's image: become "like bubbles in a glass of champagne, floating upward in unexpected and elegantly fluid ways." Simplicity must operate by intuition, not just intellect.

### Three Keys (technology markers)

- **AWAY**: move work to the cloud / a remote service. Demands reliable communication. (Google, SaaS.)
- **OPEN**: expose source or APIs. The power of the many > the power of the few. Rooted in trust (Law 8).
- **POWER**: use less battery / energy / attention. Constraints reveal better solutions ("sustainable computing").

## Application Workflow

When the user asks to simplify a screen:

1. **Audit, don't act yet.** Walk through each law and identify which the screen violates AND which it already satisfies. Skip laws that don't apply.
2. **Rank by leverage.** Most simplification gains concentrate in 2–4 laws, not all 10. Common high-leverage: #1 Reduce, #3 Time, #6 Context, #8 Trust, #10 The One.
3. **Pair Reduce with The One.** For every subtraction proposed, name what *meaningful* thing should be surfaced. Pure subtraction without addition risks emptying meaning.
4. **Use the tradeoff questions.** When stuck on a yes/no, reframe as "how X versus how Y" (see the table above) and let the user choose where to sit.
5. **Present a table to the user.** Format: Law | Gap | Concrete fix. Let them pick which to implement. Don't do all of them.
6. **Re-audit after.** A refactor often unlocks a *new* set of violations that weren't visible before.

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
| Show progress / status during invisible work (Law 3 + 8) | "Connexion à [lieu]…" before audio starts |
| Make the brand mark explain itself on hover (Law 4 RELATE-TRANSLATE-SURPRISE) | Watermark links to source project + reveals "what is this?" |
| Add ambient atmosphere that ties to the theme (Law 6 + 7) | Drifting starfield + cyan-tinted noise grain in a "space" app |
| Make returning visitors skip the intro (Law 3 SHRINK time) | localStorage flag → skip overlay on revisit |
| Embody quality where SHRINK + HIDE removed it (Law 1 EMBODY) | Heavier-than-expected weight, real materials, B&O sticker for invisible CCDs |

## Common Mistakes

- **Stripping until empty.** Subtraction without #10 (add the meaningful) creates a beautiful but lifeless screen. Always pair.
- **Treating all 10 laws as equal weight.** They're not — for any given screen, 2–4 dominate. Identify those first.
- **Ignoring #5 Differences.** A screen that's *uniformly* minimal feels flat. Keep one richer element so minimalism reads as a choice.
- **Mistaking "fewer pixels" for "simpler".** A dense data table can be simpler than a sparse 4-step wizard if it eliminates clicks. **Time (#3) often beats Reduce (#1).**
- **Skipping the audit table.** Going straight to "I'll redesign" loses leverage. Show the user a Law-by-Law gap table first; let them pick.
- **Forcing trust without the lean-back/undo choice.** If a user can't trust your Master *and* can't undo, your "simple" UI feels hostile. (Law 8.)
- **Removing emotion in the name of simplicity.** Cold, sterile minimalism violates Law 7. Feeling follows form. Add aichaku.

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

## Closing Refrain

> "Technology and life only become complex if you let it be so." — Maeda's closing essay (LIFE)

## Sources

- John Maeda, *The Laws of Simplicity*, MIT Press, 2006 — https://lawsofsimplicity.com/
- Free PDF: https://designopendata.files.wordpress.com/2014/05/lawsofsimplicity_johnmaeda.pdf
- Full canonical passages and quotes: `references/book-source.md`
