# Testing

## Running

```bash
npm test                         # full suite
npm test -- lib/simulate.test.ts # single file
npm test -- -t "test name"       # by test name
npm test -- --ci                 # matches CI invocation exactly
```

`jest-expo` preset. No dev server or Supabase connection required — the entire suite runs against
pure functions and component render output, nothing hits the network.

## What's tested

| File | Covers |
|---|---|
| `lib/simulate.test.ts` | Simulator projection math — baseline delta is zero, 13 points returned (today + 12 months), cutting coffee only ever helps, raising rent only ever hurts, break-even month detection |
| `lib/aggregate.test.ts` | Every derived-data function: spend-by-category, budget-with-spend, weekly bucketing, net worth (current + history), budget insight severity/sort/cap, achievement merging, month-boundary ISO helpers |
| `lib/format.test.ts` | `formatMoney` (signs, compaction, decimals per currency), `formatPercent`, `relativeDay`, `timeOfDay`, `greeting`, `clamp` |
| `constants/config.test.ts` | `levelFromXp` — level/title/progress math against the XP curve |
| `components/ui/Button.test.tsx` | Render + interaction |
| `components/ui/Card.test.tsx` | Render |

Test files live next to their source as `*.test.ts(x)`, not in a separate `__tests__` directory.
SVG imports are mocked via `__mocks__/svgMock.js`.

## What's *not* tested

Being direct about this rather than implying more coverage than exists:

- **No tests for the Supabase-backed `lib/data/*.ts` functions or the gamification RPCs.** These
  were verified manually, end-to-end, against production during development (see git history
  around the `feat(gamification)` / `fix(gamification)` commits) — not by an automated suite.
  There is no local Supabase instance or mocking layer set up for these.
- **No component tests for any screen** — only two shared primitives (`Button`, `Card`) have
  render tests. No screen in `app/` has test coverage.
- **No E2E tests.** No Playwright/Detox/Maestro suite exists; UI verification during development
  has been ad-hoc (manual Playwright MCP sessions against the web target, screenshotted, not
  checked into a repeatable suite).
- **No accessibility test automation** (no `jest-axe` or equivalent) — accessibility has been
  verified by manual audit and code review (roles/labels/states/contrast), not automated checks.

## Why the split

`lib/simulate.ts` and `lib/aggregate.ts` are pure functions with no React/Supabase dependency —
this is deliberate: business logic that can be tested without mocking a database or a component
tree is kept separate from the code that touches either, specifically so it *can* be tested
cheaply. New business logic should follow the same pattern: put the calculation in a pure
`lib/*.ts` function, test that function, keep the screen/hook as thin glue around it.

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every PR: `npm ci` →
`npx expo customize tsconfig.json` (generates the gitignored route types `expo start` would
normally produce — the documented no-dev-server equivalent) → `npm run typecheck` →
`npm run lint` → `npm test -- --ci`. All four gates must pass; none are currently soft/advisory.
