# API

There is no custom backend/REST API. The client talks directly to Supabase (Postgres + PostgREST
+ Auth) using the generated types in `lib/database.types.ts`. This document is a reference for
the app's actual call surface: the `lib/data/*.ts` functions every screen goes through, and the
Postgres RPCs behind them. See [ARCHITECTURE.md](ARCHITECTURE.md#data-flow) for why this layer
exists (screens never call `lib/supabase.ts` directly), and
[DATABASE.md](DATABASE.md#gamification-rpcs) for the RPC implementations themselves.

## Client

`lib/supabase.ts` — `createClient<Database>(url, publishableKey, ...)`. Auth persists via
`AsyncStorage` on native (web uses the browser's own storage); `autoRefreshToken: true`, wired to
`AppState` on native so token refresh doesn't stall while backgrounded. Both
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are required at import time
— the module throws immediately if either is missing.

The publishable (anon) key is safe to ship client-side by design; every table it can reach is
gated by RLS. See [SECURITY.md](SECURITY.md).

## `lib/data/transactions.ts`

| Function | Signature | Notes |
|---|---|---|
| `listTransactions` | `(userId, opts?: {limit?, sinceISO?}) => Transaction[]` | Ordered newest-first |
| `addTransaction` | `(input: TransactionInput) => Transaction` | Plain insert. Callers must separately call `awardTransactionXp()` after — see below |

## `lib/data/budgets.ts`

| Function | Signature | Notes |
|---|---|---|
| `listBudgets` | `(userId) => Budget[]` | |
| `seedDefaultBudgets` | `(userId, monthlyIncome) => void` | Onboarding only — inserts 8 category envelopes sized as a fixed share of income (see the function body for the per-category split) |

## `lib/data/goals.ts`

| Function | Signature | Notes |
|---|---|---|
| `listGoals` | `(userId) => Goal[]` | |
| `addGoal` | `(input: GoalInput) => Goal` | Callers must separately call `recordGoalCreated()` after |
| `contributeToGoal` | `(goalId, amount) => void` | RPC-backed (`contribute_to_goal`) — the only path that can change `goals.saved`. Throws if `amount <= 0` or the goal isn't the caller's own |

## `lib/data/achievements.ts`

| Function | Signature | Notes |
|---|---|---|
| `listAchievements` | `() => Achievement[]` | Static catalog, public read |
| `listUserAchievements` | `(userId) => UserAchievement[]` | |

`lib/aggregate.ts`'s `mergeAchievements(achievements, userAchievements)` combines the two into
the `{...achievement, unlocked, progress}` shape screens render.

## `lib/data/profiles.ts`

| Function | Signature | Notes |
|---|---|---|
| `getProfile` | `(userId) => Profile \| null` | |
| `upsertProfile` | `(input: ProfileInput) => Profile` | Used by signup (create), onboarding finish (persona/income), and Profile screen (name edit) — never for `xp`/`streak_days` |

## `lib/data/gamification.ts`

RPC-only functions, no backing table of their own. See
[DATABASE.md](DATABASE.md#gamification-rpcs) for exactly what each one computes server-side.

| Function | Signature | Call site | 
|---|---|---|
| `awardTransactionXp` | `() => void` | `app/add/index.tsx`, right after `addTransaction` succeeds |
| `recordGoalCreated` | `() => void` | `app/onboarding/index.tsx` and `app/goals/new.tsx`, right after `addGoal` succeeds |
| `recordSimulatorRun` | `(coffeeCut: number) => void` | `app/simulator/index.tsx`, on close, only if a lever was moved from baseline |

All three are called fire-and-forget with their own try/catch — a failure here never blocks or
rolls back the primary action (the transaction/goal is already saved). Errors are logged via
`reportError` (`lib/crash-reporter.ts`), not surfaced to the user, since the underlying action
already succeeded and (for XP/streak specifically) the next successful call self-heals any gap.

## Auth (`lib/auth-context.tsx`)

Not a `lib/data` file (it wraps `supabase.auth` directly, not a table), but the other half of the
app's call surface:

| Function | Notes |
|---|---|
| `signIn(email, password)` | |
| `signUp(email, password)` | Creates the `profiles` row immediately if a session comes back without email confirmation; returns `{needsEmailConfirmation}` |
| `signOut()` | |
| `deleteAccount()` | Calls the `delete_own_account` RPC, then signs out locally regardless of RPC result (the session is already dead once the row is gone) |
| `refetchProfile()` | Re-pulls the current profile — called after any write that changes it (onboarding, name edit, etc.) |

## Error handling convention

Every `lib/data`/`lib/data/gamification` function throws the raw Supabase/PostgREST error on
failure — it does not catch or reformat it. Two different consumption patterns exist by design:

- **Form submissions** (sign-in, sign-up, Add transaction, New Goal, goal contribution) catch the
  error themselves and show it close to the field/action that failed, since the message is often
  actionable ("Invalid login credentials").
- **Background reads** (everything going through `hooks/useAsync.ts`) catch the error and replace
  it with a generic "Couldn't load your data. Check your connection and try again." — a raw
  driver error isn't actionable for a failed list fetch, and the real error still reaches crash
  reporting for diagnosis.
