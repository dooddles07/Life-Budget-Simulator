# Life Budget Simulator

A budget tracker built like a life simulation. Levels, XP and streaks sit on top of your spending, and a what-if Simulator lets you drag a habit — cut coffee runs, move house, add a side hustle — and watch twelve months of net worth react in real time.

Expo SDK 57 · React Native 0.86 · React 19 · Reanimated 4 · expo-router · TypeScript.

## Run it

```bash
npm install
```

Web (fastest loop, and how this build was verified):

```bash
npx expo start --web
```

Native — scan the QR with Expo Go on a physical device:

```bash
npx expo start
```

Typecheck:

```bash
npm run typecheck
```

On desktop web the app renders inside a phone bezel. Below 900px wide the frame drops and it goes full-bleed.

## Screens

| Route | Screen |
|---|---|
| `/onboarding` | 3-step setup — persona, income, first goal. Skippable at any point. |
| `/` | Home — level and XP, net-worth counter, safe-to-spend gauge, streak, recent activity |
| `/budgets` | Envelopes with segmented fill, over-budget and limit-reached states |
| `/insights` | Category donut, weekly bars with tap-to-isolate, net-worth trend, insight cards |
| `/profile` | Level, theme, currency, reduce-motion and haptics toggles |
| `/add` | Numeric keypad sheet, expense/income direction, category picker |
| `/transactions` | Day-sectioned list with daily totals and category filters |
| `/simulator` | **The signature screen.** Five levers, live 12-month projection against a dashed baseline |
| `/goals` | Savings goals with progress and completion ETA |
| `/achievements` | Badge grid, locked vs earned, XP values |

Navigation is 4 tabs plus a centre FAB. Off-tab screens are reached from explicit affordances, so the bottom bar stays under the five-destination limit.

## About the two requested libraries

Both were checked against their actual published packages before any code was written.

**`motion` (motiondivision/motion) has no React Native renderer.** It is a React DOM library — `motion@12.43.0` peer-depends on `react-dom` and every export path is DOM-based. It is installed here as requested and is used in exactly one place where it genuinely runs: `components/device-frame/DeviceFrame.web.tsx`, the phone bezel and pointer-tracking glow on the **web** target, resolved by Metro's `.web.tsx` platform extension.

**All ten screens animate with Reanimated 4**, which runs on native *and* web. That keeps one animation codebase rather than a native path and a duplicate web path.

**21st.dev components are web JSX + Tailwind + Framer Motion and do not run in React Native.** Six were retrieved from the catalogue and ported — layout, proportions and spring parameters preserved, runtime swapped. Each port and every deviation is documented in [docs/21ST-COMPONENT-SOURCES.md](docs/21ST-COMPONENT-SOURCES.md).

## Data

Real, Supabase-backed persistence — every table is Row Level Security-scoped to the signed-in
user (see [docs/DATABASE.md](docs/DATABASE.md)). `data/seed.ts` now holds only onboarding/preset
data (categories, personas, goal presets, the Simulator's mock baseline profile), not live user
data. Logging a transaction, funding a goal, and earning an achievement all write for real and
persist across sessions — XP, streaks, and achievement unlocks are computed server-side by
`security definer` RPCs (see [docs/DATABASE.md#gamification-rpcs](docs/DATABASE.md#gamification-rpcs)),
verified end-to-end against production.

Currency defaults to **PHP (₱)** and is switchable to USD, EUR, GBP and JPY in Profile. Change the default in `constants/config.ts`.

## Accessibility

- Every foreground token verified against all three surfaces in both themes — 0 contrast failures. Body text ≥4.5:1, decorative ≥3:1.
- Touch targets ≥44pt, enforced by the shared `Pressable`.
- Reduced motion honoured from the OS, plus an in-app override. Durations collapse to 0 and values still commit, so nothing desyncs.
- Status is never colour-only — over-budget is colour *and* icon *and* text.
- `react-native-web@0.21` drops `accessibilityState`/`accessibilityValue`, so stateful controls also pass the `aria-*` form, which RN core maps natively.

## Docs

- [docs/PRD.md](docs/PRD.md) — problem, users, scope, non-goals, open product questions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — data flow, auth/routing, design tokens, motion, platform split
- [docs/API.md](docs/API.md) — every `lib/data/*.ts` function and RPC the app calls
- [docs/DATABASE.md](docs/DATABASE.md) — schema, RLS, gamification RPCs, known migration/production drift
- [docs/SECURITY.md](docs/SECURITY.md) — data isolation, accepted risks, secrets handling
- [docs/TESTING.md](docs/TESTING.md) — what's covered, what isn't, how to run it
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — EAS builds, migration deploy process, release checklist
- [docs/DESIGN.md](docs/DESIGN.md) — identity, visitor mode, motion/accessibility philosophy
- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — exact tokens, type scale, motion vocabulary, verified contrast
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — dated history of what shipped and why
- [docs/21ST-COMPONENT-SOURCES.md](docs/21ST-COMPONENT-SOURCES.md) — every ported component, its source, and what changed
- [docs/ACTIVITY-LOG.md](docs/ACTIVITY-LOG.md) — build order, decisions, and the bugs found during browser verification

## Status

Real backend, gamification fully wired and verified end-to-end against production (see
[docs/CHANGELOG.md](docs/CHANGELOG.md)). Typecheck/lint/test are clean and enforced in CI.

**Not yet run on a physical device.** Haptics and true native gesture feel are unverified on
hardware — the tablet content-width cap and keyboard-avoidance fixes specifically should be
confirmed on a real iPad/phone before wide release. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for build/release status.
