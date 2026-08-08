# Security

## Data isolation

Every user-owned table (`profiles`, `transactions`, `budgets`, `goals`, `user_achievements`) has
Postgres Row Level Security enabled, scoped to `auth.uid()` — see
[DATABASE.md](DATABASE.md#row-level-security) for the exact policy shape. There is no
application-level authorization layer on top of this; RLS is the only thing standing between one
user's data and another's, so any new table holding user data must get the same policy from day
one.

## Account deletion

`deleteAccount()` calls a `security definer` Postgres RPC (`delete_own_account`,
`supabase/migrations/0002_delete_own_account.sql`) rather than the client ever holding
admin/service-role privileges. The function is `revoke all ... from public` and
`grant execute ... to authenticated` only, scopes the delete to `auth.uid()` internally (never
accepts a target user id from the caller), and sets `search_path = public` to prevent search-path
hijacking. Every owned table cascades from `auth.users` on delete, so one RPC call removes
everything the user owns.

## Gamification writes

XP, streak, and achievement unlocks are computed and written by `security definer` RPCs, not
direct client `.update()` calls — see [DATABASE.md](DATABASE.md#gamification-rpcs). Each function
computes its own effect internally (a fixed XP award, a recomputed streak, a real unlock
condition) and never accepts a client-supplied target value. This is enforcement by *convention*
(the app simply never asks the client to write those columns directly), not by a hard RLS/column
restriction — see the accepted risk below for what that means in practice.

## Accepted risk: column-level write scope

RLS restricts which **rows** a user can write, not which **columns**. A user's own `profiles` and
`user_achievements` rows are fully writable by their own JWT under the current `for all` policies,
including `xp`, `streak_days`, `unlocked`, and `progress`. A modified client (or anyone calling
the Supabase REST API directly with a valid session token) could self-forge these values —
e.g. `supabase.from('profiles').update({xp: 999999})` — bypassing the RPCs entirely.

**Accepted today because:**
- The app is single-player. Forged progress only affects the forger's own view of their own data.
- There is no leaderboard, no cross-user comparison, no reward with real-world value tied to XP
  or achievements.

**Would need to change if:** a leaderboard, social sharing, or any feature comparing users'
progress against each other ships. At that point, the fix is either column-level RLS (Postgres
supports per-column grants) or moving `xp`/`streak_days`/`user_achievements` writes to a table the
`authenticated` role has no direct grant on at all, forcing every write through the RPCs.

## Secrets

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are meant to be public —
  Supabase's anon/publishable key is safe to ship client-side by design, protected entirely by
  RLS. `lib/supabase.ts` throws at import time if either is missing.
- `EXPO_PUBLIC_SENTRY_DSN` is optional; `lib/crash-reporter.ts` is a no-op console logger without
  it.
- No service-role key, database password, or other genuinely secret credential appears anywhere
  in the client bundle or repo. `.env` is gitignored; only `.env.example` (no real values) is
  tracked.
- `eas.json`'s `preview`/`production` build profiles carry no secrets, only
  `SENTRY_DISABLE_AUTO_UPLOAD: "true"` (no auth token is configured yet for sourcemap upload —
  see [DEPLOYMENT.md](DEPLOYMENT.md)).

## What was checked and found clean

From a full-project security pass (see git history around
`fix(gamification): correct achievement ids...` and the commits before it):

- No injection surface — every Supabase call goes through the typed query builder, no raw SQL
  string concatenation anywhere in client code.
- No secrets committed, past or present, in tracked files.
- No `dangerouslySetInnerHTML`-equivalent, no `eval`, no dynamic script injection on the web
  target.
- Auth errors from `sign-in`/`sign-up` are shown to the user directly (not swallowed), since
  they're genuinely actionable; background list-fetch errors are generalized (see
  [API.md](API.md#error-handling-convention)) so a raw driver string never reaches the UI where it
  isn't actionable.

## Known gap: session storage on native

Session/refresh tokens persist via `@react-native-async-storage/async-storage` on native
(`lib/supabase.ts`), which is unencrypted on-device storage. Supabase's own guidance for
production apps handling sensitive data is to use `expo-secure-store` (backed by iOS Keychain /
Android Keystore) instead. This has not been changed — flagging it here rather than silently
carrying the gap forward. Given this app stores financial transaction data, this is a reasonable
next hardening step before a wide production launch, not an immediate blocker (the same class of
risk — a compromised/rooted device reading app-local storage — applies to most React Native apps
using the default Supabase Expo setup).
