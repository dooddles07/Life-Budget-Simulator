# SHIP-READINESS-AUDIT

Audit date: 2026-08-02. Scope: everything between current state and a real, shippable release.

## Summary

Life Budget Simulator is a polished UI prototype. Ten screens, verified typecheck, strong accessibility/contrast work already done. But: all data is mock and non-persistent, there is no backend, no tests, no CI, no build/release config, and the app has only been run on one web viewport — never a physical device. It is not shippable as-is; it's a design/interaction demo.

## Blocking (must fix before any real launch)

| Item | Why it matters | Effort |
|---|---|---|
| No data persistence | `data/seed.ts` is hardcoded mock data; nothing written by the app survives a reload. Add screen (`app/add/index.tsx`) accepts input and discards it. App is unusable as a real budget tracker. | L |
| Never run on a physical device | README admits haptics (`hooks/useHaptics.ts`) and native gesture feel are unverified. `newArchEnabled: true` (RN 0.86 + Reanimated 4) has no on-device smoke test. Could break on real hardware. | S |
| No `eas.json` | No build profiles (dev/preview/production) exist — can't produce an installable native build at all. | S |
| No privacy policy | Mandatory for both App Store and Play Store submission, and non-negotiable once real financial data is stored (even locally). | S |
| No app store listing assets | No screenshots, no preview video, no listing copy. Can't submit without these. | M |
| Confirm production bundle IDs | `dev.dooddles.lifebudgetsimulator` (iOS/Android) looks like a placeholder. Bundle ID can't change after first submission without creating a new store listing. Confirm intentional before first build. | S |

## High priority

| Item | Why it matters | Effort |
|---|---|---|
| No error boundary in `app/_layout.tsx` | Any render crash takes down the whole app with no fallback UI — bad first impression, no recovery path. | S |
| No crash reporting (Sentry/Bugsnag/etc.) | Once shipped, you have zero visibility into production crashes. | S |
| Zero tests | No unit/integration/E2E tests anywhere. No test runner installed. Any refactor is unverified except by hand. | M |
| No CI | No `.github/` workflows — typecheck/lint/tests aren't enforced on push, regressions can land silently. | S |
| Repo hygiene: uncommitted/stray files | `package.json` has an uncommitted script change (`expo start --X` → `expo run:X`). 6 stray build-log/bat files at repo root are untracked and not gitignored (`.expo-android.log`, `expo-android-err.log`, `expo-android-out.log`, `run-android-err.log`, `run-android-out.log`, `run-android.bat`). Clean up or gitignore. | S |

## Medium priority

| Item | Why it matters | Effort |
|---|---|---|
| No analytics | No way to learn what users actually do post-launch. | S |
| No lint config | `prettier-plugin-tailwindcss` is installed but there's no ESLint/Prettier config for it to plug into — dead dependency currently. No `lint` script in `package.json`. | S |
| Only one viewport verified | Verified at 390×844 web only; no tablet/large-screen check, no other device sizes. | M |
| No screen-reader pass | Contrast and touch-target work is done, but no actual VoiceOver/TalkBack walkthrough yet. | M |
| App icon/splash not checked against store specs | Raw PNGs exist in `assets/` but haven't been confirmed against iOS/Android safe-area and size requirements. | S |

## Nice-to-have

| Item | Why it matters | Effort |
|---|---|---|
| `.env.example` / documented env pattern | No secrets in use today, but once a backend exists this prevents ad-hoc env var sprawl. | S |
| Data export/backup | Once persistence exists, users will want to export their data. | M |
| Multi-device sync / auth | Only relevant once there's a backend; out of scope until persistence lands. | L |

## Already verified — don't regress

- `npm run typecheck` passes clean (re-confirmed 2026-08-02).
- Ten screens render on web at 390×844, light and dark, zero console errors.
- Accessibility: 0 contrast failures across all surface/theme combos, touch targets ≥44pt, reduced-motion honored, status never color-only.

## Suggested order of attack

1. Repo hygiene cleanup (fast, unblocks clean commits going forward)
2. Data persistence layer (unblocks everything else being "real")
3. Physical device pass (native gestures/haptics/New Architecture)
4. Error boundary + crash reporting (cheap insurance before wider testing)
5. `eas.json` + first internal build
6. Tests + CI (protects velocity once more people touch the code)
7. Store assets + privacy policy + submission
