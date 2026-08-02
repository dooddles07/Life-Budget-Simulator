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

Mock only. `data/seed.ts` holds one month of transactions anchored to the current date, plus budgets, goals, achievements and personas. Nothing persists — every launch replays the same month, which keeps demos and screenshots reproducible. The Add screen acknowledges an entry and closes without writing.

Currency defaults to **PHP (₱)** and is switchable to USD, EUR, GBP and JPY in Profile. Change the default in `constants/config.ts`.

## Accessibility

- Every foreground token verified against all three surfaces in both themes — 0 contrast failures. Body text ≥4.5:1, decorative ≥3:1.
- Touch targets ≥44pt, enforced by the shared `Pressable`.
- Reduced motion honoured from the OS, plus an in-app override. Durations collapse to 0 and values still commit, so nothing desyncs.
- Status is never colour-only — over-budget is colour *and* icon *and* text.
- `react-native-web@0.21` drops `accessibilityState`/`accessibilityValue`, so stateful controls also pass the `aria-*` form, which RN core maps natively.

## Docs

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — tokens, type scale, motion vocabulary, verified contrast
- [docs/21ST-COMPONENT-SOURCES.md](docs/21ST-COMPONENT-SOURCES.md) — every ported component, its source, and what changed
- [docs/ACTIVITY-LOG.md](docs/ACTIVITY-LOG.md) — build order, decisions, and the bugs found during browser verification

## Status

Verified on the web target at 390×844 in light and dark: all ten screens render, typecheck is clean, a fresh load logs zero console errors, and the Simulator, transaction filters and theme switch were driven end-to-end.

**Not yet run on a physical device.** This machine has no Android SDK, so haptics and true native gesture feel are unverified — use Expo Go to confirm.
