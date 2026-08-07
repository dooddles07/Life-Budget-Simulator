# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Filipino consumers tracking personal budgets, spanning four onboarding personas with distinct income/life stage: **Student** (allowance, dorm life, tight margins, ~₱12k/mo), **Fresh Grad** (first salary/rent, ~₱32k/mo), **Side Hustler** (day job plus freelance income, ~₱70.5k/mo), **Provider** (family budget, long horizon, ~₱110k/mo). Onboarding captures persona, income, and a first goal, and is skippable at any point. Local market context is baked into seed data (Grab, Meralco, Globe, Jeepney/MRT, S&R) and PHP is the default currency (switchable to USD/EUR/GBP/JPY).

## Product Purpose

A personal budget tracker that layers life-simulation game mechanics (levels, XP, streaks, achievements) over real expense/income logging, envelope budgets, and savings goals — plus a what-if Simulator that projects 12 months of net worth against levers like cutting a habit, moving house, or adding a side hustle. Success is a user who keeps logging daily (streak-driven habit loop) and uses the Simulator to make a real financial decision.

## Positioning

The Simulator is the mechanism a plain budgeting ledger can't copy: drag levers, watch a 12-month net-worth projection react against a dashed baseline in real time, all inside a game-HUD framing (levels/XP/streaks) rather than a spreadsheet-style interface.

## Operating Context

Mobile-first, shipped natively to iOS and Android via Expo/EAS (`eas build --platform ios|android`), with web serving as a dev-preview surface only — desktop web renders the app inside a phone bezel, dropping to full-bleed under 900px. Core loop: onboard (persona/income/goal) → log transactions (Add screen, numeric keypad) → track budgets/insights/net worth on Home → periodically open Simulator to test what-ifs → manage Goals/Achievements. Auth (sign in/up, delete account) is Supabase-backed.

## Capabilities and Constraints

- Per-user data isolated end-to-end via Postgres RLS scoped to `auth.uid()` (`supabase/migrations/`); account deletion is a `security definer` RPC only — no client-side admin calls.
- Data flow is fixed: `lib/data/*.ts` (Supabase queries) → `hooks/use*.ts` (via `useAsync`) → screen. No component calls Supabase directly.
- All cross-platform motion runs on Reanimated 4; the `motion` (DOM) library is a deliberate single exception for the web-only phone-bezel frame (`DeviceFrame.web.tsx`) and must not spread to a second use.
- Two separate icon systems exist and must stay in sync: bundled Lucide SVGs for in-app UI vs. a kebab-case `icon` string stored per goal/achievement row, resolved through `lib/icons.ts`.
- Reduced motion is OS-level only; there is no in-app override toggle.
- Currency is configurable per user (PHP default); default is set in `constants/config.ts`.

## Brand Commitments

Name: **Life Budget Simulator**. Design theme name: **Neon Life-Sim** — a finance app deliberately rendered as a game HUD (levels, XP, streaks) on an OLED-black dark-primary theme with an electric-violet + lime accent pair; light mode is a full parallel palette, not a derivation. Typography: Outfit for display/hero money figures, Plus Jakarta Sans for body/UI. Icons are Lucide only, stroke width 1.75 everywhere; no emoji is used as an icon anywhere in the app.

## Evidence on Hand

`data/seed.ts` holds onboarding/preset data only — categories, the four personas above, Goal presets, and the Simulator's baseline profile numbers. Live transactions, budgets, goals, and achievements are now read from per-user Supabase tables via `lib/data/*.ts` (`supabase/migrations/0001_init.sql`, `0002_delete_own_account.sql`). **Note:** `README.md` still states "Mock only... nothing persists," which is stale against this Supabase-backed state — don't treat that line as current truth without re-verifying.

## Product Principles

1. Protect the Simulator's clarity and real-time feel above every other screen — it's the signature differentiator, not a secondary feature.
2. Gamification (levels/XP/streaks/achievements) must track real logged data, never simulated or fabricated progress.
3. Every user's data stays isolated by RLS; never introduce a path that reads or writes across users, even for convenience.
4. One motion system (Reanimated 4) across platforms — don't fork a second animation library beyond the single documented DOM exception.
5. Respect native platform mechanics per OS (Android edge-to-edge + predictive-back, iOS tablet support) even though the visual theme itself stays unified rather than adapting per OS.

## Accessibility & Inclusion

Every foreground token verified at ≥4.5:1 (body) / ≥3:1 (decorative/disabled) across all surfaces in both themes — zero contrast failures. Touch targets ≥44pt via the shared `Pressable`. Status is never colour-only (icon + text + colour). `react-native-web@0.21` drops `accessibilityState`/`accessibilityValue`, so stateful controls also carry the `aria-*` form.
