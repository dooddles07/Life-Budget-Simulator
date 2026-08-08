# Changelog

Format loosely follows [Keep a Changelog](https://keepachangelog.com/). No version tags exist yet
(`package.json` has stayed at `1.0.0` throughout pre-launch development) — entries are grouped by
date and theme instead. Newest first.

## 2026-08-08 — Gamification made real

The core game loop (levels, XP, streaks, achievements) went from entirely decorative to fully
functional, server-enforced, and verified end-to-end against production.

- **Added** `award_transaction_xp`, `record_goal_created`, `contribute_to_goal`,
  `record_simulator_run` — `security definer` Postgres RPCs that compute and write XP, streak,
  and achievement state server-side (`supabase/migrations/0003_gamification.sql`,
  `0004_gamification_fix.sql`). See [DATABASE.md](DATABASE.md#gamification-rpcs).
- **Added** a goal-contribution flow (Goals screen, inline "Add funds") — the only path that can
  change `goals.saved`, which previously had no write path at all past creation.
- **Fixed** a real bug caught only by live testing: `0003`'s achievement ids (`a1`–`a9`, matching
  this repo's own seed data) didn't match the ids actually seeded in production
  (`first-entry`, `week-streak`, etc.). `0004_gamification_fix.sql` corrects every RPC to the
  real catalog. See [DATABASE.md](DATABASE.md#known-drift-migration-history-vs-production).
- **Fixed** `app/add/index.tsx`'s post-save `setTimeout` not being cleared on unmount.
- **Fixed** `app/(tabs)/profile.tsx`'s name-edit silently reverting on save failure with no
  feedback to the user.
- **Fixed** unbounded numeric input on the Add screen's keypad (no cap on whole-digit count) and
  the New Goal custom-amount fields (no `maxLength`).
- **Added** empty-state copy for a zero-goal / zero-achievement account.
- **Fixed** Transactions screen missing the tablet content-width cap every other screen already
  had (it builds its own `View`/`SectionList` instead of using the shared `Screen` component).

## 2026-08-07/08 — Production-readiness audit

A full UI/UX/accessibility/platform audit (`/impeccable audit`, scored against iOS/Android
platform references) followed by a bounded fix pass, then a second pass covering security and
correctness bugs.

- **Fixed** `TextField` never forwarding an `accessibilityLabel` to its input — every form field
  in the app (sign-in, sign-up, New Goal) was reading as an unlabeled "text field" to a screen
  reader.
- **Fixed** no keyboard-avoidance on sign-in/sign-up — the password field/submit button could sit
  under the keyboard on short devices.
- **Added** a tablet content-width cap (`Screen`'s `CONTENT_MAX_WIDTH`) so cards don't stretch
  edge-to-edge on iPad.
- **Fixed** raw Supabase/Postgrest error messages leaking to `ErrorState` — background fetch
  failures now show a friendly message while the real error still reaches crash reporting.
- **Added** a merged accessibility label on Home's budget-burn ring, matching the pattern used
  everywhere else in the app.
- **Fixed** the Home screen's profile name never actually being set (defaulted from email local
  part at signup, but Profile's editable name field wasn't wired to persist correctly).
- **Added** brand logo system (vector source, shared `Logo` component) across sign-in/sign-up/Home.
- **Fixed** motion: removed bouncy spring overshoot as the default; removed an in-app
  reduce-motion override in favor of OS-level only.

## 2026-08-07 — Store readiness

- **Added** in-app account deletion (`delete_own_account` RPC) and a privacy policy.
- **Added** Sentry crash reporting, inert until `EXPO_PUBLIC_SENTRY_DSN` is set.
- **Added** draft App Store/Play Store listing copy and screenshots (`docs/STORE-LISTING.md`,
  `screenshots/`).
- **Added** SEO/web meta tags, Open Graph, `robots.txt`.
- **Fixed** stale data on Home/Budgets/Transactions/Insights after logging a transaction in the
  Add modal — screens now refetch on focus (`hooks/useAsync.ts`).
- **Fixed** Sentry Gradle plugin failing preview/production builds (no auth token configured) by
  disabling auto sourcemap upload.

## 2026-08-02/03 — Real backend

The single largest architectural shift: from fully mock, non-persistent data to a real
Supabase-backed app.

- **Added** Postgres schema + Row Level Security (`supabase/migrations/0001_init.sql`) —
  `profiles`, `transactions`, `budgets`, `goals`, `achievements`, `user_achievements`, every
  owned table isolated to `auth.uid()`.
- **Added** Supabase client + typed `lib/data/*.ts` data-access layer.
- **Added** email/password auth with `Stack.Protected`-based route guarding.
- **Added** jest-expo test suite + GitHub Actions CI (typecheck, lint, test on every push/PR).
- **Fixed** two dead-end write paths (Add screen, New Goal) that accepted input and silently
  discarded it — now real inserts.
- **Changed** icon system from `lucide-react-native` to Iconify-sourced SVGs
  (`scripts/generate-icons.mjs` → `assets/icons/lucide/`), avoiding a native-linking dependency.

## 2026-08-01/02 — Initial build

- **Added** the original ten-screen UI prototype: Home, Budgets, Insights, Profile, Add,
  Transactions, Simulator, Goals, Achievements, onboarding — built against fully mock,
  non-persistent data (`data/seed.ts`).
- **Added** the what-if Simulator — the product's signature mechanism, five levers projecting 12
  months of net worth against a baseline.
- **Added** initial design system (Neon Life-Sim theme, tokens, motion vocabulary) — see
  [DESIGN.md](DESIGN.md) / [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).
