# Design

This is the visual-identity and design-philosophy record. For exact values — hex codes, the type
scale, motion timing constants, verified contrast numbers — see
[docs/DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), the token reference. This file is the *why* behind
those tokens.

## Identity: Neon Life-Sim

The product name promises a simulation, so the interface is deliberately built like a game HUD
laid over a finance app — levels, XP, streaks, an unlock-burst animation on earned achievements —
rendered on OLED black with an electric-violet and lime accent pair. This is a committed brand
direction, not a default: it was chosen specifically so the app *feels* like a life-sim game a
user wants to open daily, not a ledger they feel obligated to open. Dark is the primary theme;
light is a full parallel palette (not a derived/inverted one) — lime is unreadable on white, so
light mode substitutes olive at the same hue family, and violet darkens to hold 4.5:1 contrast.

## Visitor mode: Operate

In the mode taxonomy this app is built against, it's **Operate**: the visitor is here to complete
a task (log a transaction, check a budget, run a what-if), not to be persuaded or to browse. That
means scanability, consistency, and native platform expectations outrank pure visual expression —
brand lives in the details (color, type, the game-HUD motion vocabulary) rather than in breaking
navigation conventions. The one deliberate exception is the tab bar (see below).

## Platform conformance stance

The floating pill tab bar with a center FAB (`components/nav/TabBar.tsx`, ported from a 21st.dev
pattern) is a **deliberate branded departure** from a stock bottom tab bar, not an oversight. It
still satisfies every functional platform requirement — bottom position, ≤5 destinations, correct
accessibility roles/labels/selected-state, safe-area-aware insets — while carrying the brand's
visual signature into the one piece of chrome present on every screen. Everywhere else, native
mechanics are respected as-is: no disabled system back-gesture, Android edge-to-edge +
predictive-back honored, iOS tablet support (`supportsTablet: true`) accounted for via a
tablet content-width cap in the shared `Screen` component. See
[ARCHITECTURE.md](ARCHITECTURE.md#platform-split) for the technical detail.

## Motion philosophy

One authored moment per interaction, gated centrally through `hooks/useMotion.ts` — never
scattered ad-hoc animation calls, never the same entrance repeated meaninglessly on every element.
Reduced motion (OS-level only, no in-app override) collapses every duration to 0 while still
committing every value to its target, so layout and state can never desync from what the user
sees. The one animation with real narrative weight — an achievement's unlock burst
(`app/achievements/index.tsx`) — is a one-shot pop specifically so an earned badge feels granted,
not just listed.

## Accessibility as a design constraint, not a pass

Every foreground token was checked against all three surfaces in both themes before shipping —
zero contrast failures, body text ≥4.5:1, decorative ≥3:1 (`fgFaint`). Status is never color-only:
an over-budget envelope is color *and* a `TriangleAlert` icon *and* the text "₱x over," not a
red number alone. Touch targets are ≥44pt everywhere, enforced by the one shared `Pressable`
primitive rather than left to each screen to remember. This was treated as a design input from
the start, not a compliance pass bolted on afterward — see the accessibility fixes folded into
the production-readiness commits in git history for what still needed correcting even with that
starting discipline (e.g. form fields needing an explicit `accessibilityLabel`, since React
Native doesn't auto-associate a visible label `<Text>` with a sibling `<TextInput>` the way HTML's
`<label for>` does).

## Icons and imagery

Lucide only, one stroke width (1.75) everywhere, sourced as real SVG components — never emoji, and
never a second icon family mixed in for "flavor." Category and achievement colors are
index-stable swatch arrays (`theme.categories[]`) — a category's color is its array index, so the
array is never reordered once in use, or every existing user's category colors would silently
reassign.

## What's still unsettled

- The Simulator's visual data (rent, coffee spend, subscriptions) is static mock content, not the
  signed-in user's real numbers — see [ARCHITECTURE.md](ARCHITECTURE.md#whats-not-personalized-yet).
  Any future design work on that screen should design for real, variable-length real data
  (a user with 15 subscriptions, not the mock's fixed 5) rather than the current fixed mock shape.
- No dedicated empty-state illustration system exists — empty states today are icon + two lines
  of copy (see `ListEmptyComponent` in `app/transactions/index.tsx` for the pattern), not
  custom artwork.
