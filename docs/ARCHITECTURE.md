# Architecture

Stack: Expo SDK 57 · React Native 0.86 · React 19 · Reanimated 4 · expo-router · TypeScript ·
Supabase (Postgres + Auth) · NativeWind/Tailwind.

## Data flow

Three layers, always in this order:

```
lib/data/*.ts  →  hooks/use*.ts  →  screen component
(Supabase I/O)    (useAsync wrapper)   (renders data/loading/error)
```

- **`lib/data/*.ts`** — thin, typed Supabase query functions, one file per table
  (`transactions.ts`, `budgets.ts`, `goals.ts`, `achievements.ts`, `profiles.ts`) plus
  `gamification.ts` for the RPC-only calls that have no backing table of their own. No component
  ever imports `lib/supabase.ts` directly.
- **`hooks/use*.ts`** — each wraps one or more `lib/data` calls in `hooks/useAsync.ts`, the single
  fetch/loading/error/refetch primitive every data hook shares. `useAsync` also refetches on
  screen focus (via expo-router's `useFocusEffect`), which is what makes Home's net worth update
  after logging a transaction in the Add modal without a manual pull-to-refresh.
- **Screens** render `{data, loading, error, refetch}` — every data screen shows a distinct
  loading state, error state (with retry), and empty state; see `components/ui/AsyncState.tsx`.

Derived numbers (spend by category, net worth history, budget insights) are computed live from
real rows in `lib/aggregate.ts`, never stored and incremented — the same principle the
gamification RPCs use server-side (see [DATABASE.md](DATABASE.md#gamification-rpcs)). This is a
deliberate, repeated choice in this codebase: a value that can be recomputed from source rows is
recomputed, not cached in a column that can drift.

## Auth and routing

`app/_layout.tsx`'s `AuthProvider` (`lib/auth-context.tsx`) exposes
`session`/`profile`/`signIn`/`signUp`/`signOut`/`deleteAccount`/`refetchProfile`. The root `Stack`
uses `Stack.Protected` guards keyed off three conditions — `!session`, `!!session && !onboarded`,
`!!session && onboarded` — to route between the `(auth)` group, `/onboarding`, and the main
`(tabs)` + modal screens. There is no separate route-guard middleware; those three conditions are
the entire routing logic.

`onboarded` is derived as `!!profile?.persona_id` — a user with a session but no persona is
always routed back to onboarding, even mid-session, until onboarding's `finish()` (or Skip)
upserts a `persona_id`.

## Design tokens

One direction: `constants/theme.ts` (colors, spacing, radius, motion timings) →
`hooks/useTheme.tsx`'s `PrefsProvider` (resolves light/dark, currency, haptics preference) →
`components/ui/*` primitives via `useTheme()`. Dark is the primary theme; light is a full parallel
palette, not a derivation — see [DESIGN.md](DESIGN.md). Reduced motion is OS-level only
(`useReducedMotion` from Reanimated); there is no in-app override toggle.

## Motion

`hooks/useMotion.ts` is the only place animations are constructed outside of gesture/derived
worklets. `enter`/`enterList` for entrances, `toSpring`/`toTiming` for value animations. Default
spring is `motion.springSoft` (critically damped, no overshoot). Two files call
`withSpring`/`withTiming` directly instead of going through the hook —
`components/ui/Slider.tsx` and `components/nav/TabBar.tsx` — because Reanimated's
autoworketization doesn't extend across module boundaries into a hook-returned closure when
called from inside a gesture worklet (`.onBegin`/`.onUpdate`/`.onFinalize`) or `useDerivedValue`.
Both files inline the reduced-motion check themselves; this is a documented exception, not a
violation.

## Icon systems (two, deliberately separate)

- **In-app UI icons**: `scripts/generate-icons.mjs` fetches SVGs from the Iconify API into
  `assets/icons/lucide/`; `react-native-svg-transformer` turns them into components at bundle
  time; `lib/lucide-icons.tsx` re-exports them with a `size` prop shim matching lucide's API.
- **DB-stored icon keys**: `goals.icon` / `achievements.icon` store a kebab-case string
  (e.g. `"piggy-bank"`); `lib/icons.ts`'s `ICON_BY_KEY` map resolves that string back to a
  component, falling back to a generic `Target` icon for an unrecognized key rather than
  crashing. Adding a new goal/achievement icon means adding it to both this map and wherever the
  kebab-case key is written.

## Platform split

Web output mode is `"single"` (SPA), not `"static"` — `app/+html.tsx` has no effect under this
mode. Web `<head>` meta tags live in `public/index.html`, copied verbatim into the web build by
Metro. `motion` (motiondivision) is the one DOM-only dependency, used in exactly one file
(`components/device-frame/DeviceFrame.web.tsx`, the phone-bezel dev-preview shell shown on wide
web viewports — never the real mobile presentation). Every other animation in the app runs on
Reanimated 4, which works on native and web alike; don't add a second `motion`-based animation
path.

Platform is `adaptive` per [PRODUCT.md](PRODUCT.md#platform): the app ships identically to iOS
and Android (same custom "Neon Life-Sim" visual theme, not per-OS HIG/Material styling) but still
respects real platform mechanics — Android edge-to-edge + predictive-back, iOS tablet support,
safe-area insets everywhere via `react-native-safe-area-context`.

## Internationalization

The app is English-only by design — every string in every screen is a hardcoded English literal,
and date/time formatting (`lib/format.ts`) explicitly pins `"en-US"` rather than following the
device locale, specifically so date strings stay consistent with the rest of the (English) UI.
This was a deliberate choice made during a production-readiness pass, not an oversight: partial
locale-awareness (dates in the device's format, everything else in English) was judged worse than
consistent English throughout. Full i18n is out of scope — see [PRD.md](PRD.md#non-goals-explicitly-out-of-scope-today).

## What's *not* personalized yet

The Simulator's baseline (`data/seed.ts`'s `PROFILE`) is static mock data — Manila-office-worker
figures for rent, coffee spend, and subscriptions — not the signed-in user's real numbers.
`profiles.monthly_fixed`, `monthly_variable`, `coffee_per_month`, and `subscriptions` are real
schema columns that nothing in the app currently reads or writes. This is the largest known gap
between "demo" and "real financial tool" — see [PRD.md](PRD.md#open-product-questions).
