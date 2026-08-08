# Product Requirements Document

Status: living document, reflects the app as built. Source of truth for product intent is
[docs/PRODUCT.md](PRODUCT.md) (durable product facts); this file is the narrative version —
problem, users, scope, success criteria.

## Problem

Budget trackers are ledgers: log a transaction, look at a pie chart, feel nothing. They don't
answer the question that actually changes behavior — *if I cut this habit, what happens to my
life in a year?* Life Budget Simulator answers that question directly with a what-if Simulator,
and wraps the daily logging habit in game mechanics (levels, XP, streaks, achievements) so the
habit itself has a reason to stick.

## Users

Four onboarding personas, chosen to cover the income/life-stage range of a young Filipino
budgeter (see [PRODUCT.md](PRODUCT.md#users) for exact figures):

| Persona | Situation |
|---|---|
| Student | Allowance, dorm life, tight margins |
| Fresh Grad | First salary, first rent, first mistakes |
| Side Hustler | Day job plus freelance income |
| Provider | Family budget, long horizon |

Persona selection only seeds a starting income figure and default budget envelopes at
onboarding — it is not stored as a behavioral segment anywhere past that point.

## Goals

1. **Make the daily logging habit stick.** Streaks, XP, and achievements should track real
   activity, not be decorative — see [DATABASE.md](DATABASE.md#gamification-rpcs) for how this
   is enforced server-side.
2. **Make "what if" concrete.** The Simulator is the product's mechanism a plain ledger app
   can't copy: five levers, a live 12-month projection against a dashed baseline.
3. **Never lie about money.** Every derived number (spend, net worth, budget insights) is
   computed from real transaction rows at query/render time, never a stored value that can
   drift out of sync — see `lib/aggregate.ts`.

## Non-goals (explicitly out of scope today)

- **Multi-currency accounts.** Currency is a display preference (`profiles` via client state,
  not persisted per-transaction); there's no FX conversion or multi-currency ledger.
- **Debt/liability tracking.** No schema concept of a loan, credit balance, or liability exists.
  The `net-worth-climber` achievement is the closest proxy today (see
  [DATABASE.md](DATABASE.md#known-approximations)).
- **Social features.** No sharing, leaderboards, or multi-user households. Every table is
  isolated per `auth.uid()`.
- **Offline-first.** The app requires a live Supabase connection for every read/write; there is
  no local queue or offline mutation support.
- **Full i18n.** UI copy is English-only by design; see the locale note in
  [ARCHITECTURE.md](ARCHITECTURE.md#internationalization).

## Feature scope (screens)

| Route | Job |
|---|---|
| `/onboarding` | Capture persona, income, first goal in 3 steps. Skippable. |
| `/` (Home) | Level/XP, net worth, safe-to-spend gauge, streak, recent activity, Simulator entry point |
| `/budgets` | Envelope spend vs. limit per category |
| `/insights` | Category breakdown, weekly rhythm, net-worth trend, budget insight cards |
| `/add` | Fast numeric-keypad transaction entry |
| `/transactions` | Full history, day-sectioned, category-filterable |
| `/simulator` | Five what-if levers, live 12-month projection vs. baseline |
| `/goals` | Savings goals, progress, contribute funds |
| `/achievements` | Badge grid — 9 achievements, real unlock logic |
| `/profile` | Identity, theme/currency/haptics prefs, achievements/goals summary, account deletion |

## Success criteria

No production analytics are wired yet (see [DEPLOYMENT.md](DEPLOYMENT.md) for what's
instrumented today — Sentry crash reporting only). Until analytics exist, "success" is verified
manually against these behaviors, not a dashboard:

- A logged transaction visibly changes XP/streak/net worth within one screen focus cycle.
- Every one of the 9 achievements has a real, verifiable unlock path from real data (confirmed
  end-to-end against production in the session that shipped
  `supabase/migrations/0004_gamification_fix.sql`).
- The Simulator's projection reacts to every lever in real time with no perceptible jank.

## Open product questions

Tracked here rather than silently resolved, so they don't get lost:

- Should `starting_net_worth` be collected at onboarding? Today it defaults to 0 for every
  signup, meaning net worth is always relative to "since I started using this app," not a true
  starting position.
- The Simulator's baseline profile (`data/seed.ts`'s `PROFILE`) is not the signed-in user's real
  financial data (`profiles.monthly_fixed`/`monthly_variable`/`coffee_per_month`/`subscriptions`
  are schema columns nothing ever writes). Personalizing the Simulator is the single largest
  gap between "demo" and "real financial tool."
- Three of the nine achievements (`budget-keeper`, `coffee-cutter`, `net-worth-climber`) are
  best-effort approximations of their own copy, not exact matches — see
  [DATABASE.md](DATABASE.md#known-approximations) before promising them in marketing copy.
