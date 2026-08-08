# Database

Postgres via Supabase. Schema lives in `supabase/migrations/`, applied in order:

| Migration | Adds |
|---|---|
| `0001_init.sql` | Core tables (`profiles`, `transactions`, `budgets`, `goals`, `achievements`, `user_achievements`), indexes, RLS policies, achievement catalog seed |
| `0002_delete_own_account.sql` | `delete_own_account()` RPC |
| `0003_gamification.sql` | First pass at XP/streak/achievement RPCs |
| `0004_gamification_fix.sql` | Corrects `0003` — see [Known drift](#known-drift-migration-history-vs-production) below |

## ⚠️ Known drift: migration history vs. production

**The achievement catalog seeded by `0001_init.sql` does not match what's actually in the
production `achievements` table.** The committed migration seeds ids `a1`–`a9`. Production
already contained a different, more specific 9-row catalog — seeded outside this repo's migration
history at some point before the gamification RPCs were written — using these real ids:

| id | title | xp | detail |
|---|---|---|---|
| `first-entry` | First entry | 10 | Log your first transaction |
| `week-streak` | 7-day streak | 25 | Open the app 7 days in a row |
| `budget-keeper` | Budget keeper | 50 | Stay under budget in every category for a month |
| `goal-starter` | Goal starter | 10 | Create your first savings goal |
| `goal-halfway` | Halfway there | 20 | Reach 50% of a savings goal |
| `goal-crusher` | Goal crusher | 50 | Fully fund a savings goal |
| `simulator-explorer` | Simulator explorer | 15 | Run 5 what-if scenarios |
| `coffee-cutter` | Coffee cutter | 15 | Reduce simulated coffee spend to zero |
| `net-worth-climber` | Net worth climber | 30 | Grow net worth 3 months running |

This was discovered the hard way: `0003_gamification.sql` was written against the `a1`-`a9` ids
(matching both `0001_init.sql`'s seed and `data/seed.ts`'s unused mock `ACHIEVEMENTS` array) and
failed its first real call in production with a foreign-key violation
(`Key (achievement_id)=(a2) is not present`). `0004_gamification_fix.sql` corrects every RPC to
use the real ids above and was verified end-to-end against production (all 6 achievements
reachable without new usage over time were unlocked in one test pass, exact XP arithmetic).

**If you ever run `0001_init.sql` against a fresh database, its achievement seed will NOT match
what `0003`/`0004`'s RPCs expect.** Either update `0001`'s seed insert to the real catalog above,
or reseed manually, before relying on gamification in a new environment.

## Tables

### `profiles`

One row per `auth.users`, id-matched (`profiles.id = auth.users.id`, cascades on delete). Created
by the app at signup/onboarding, not a trigger, so onboarding can upsert persona/income/goal in
one call alongside profile creation.

| Column | Notes |
|---|---|
| `xp`, `streak_days` | Written **only** by the gamification RPCs — never directly by the client. See [Gamification RPCs](#gamification-rpcs). |
| `starting_net_worth` | Defaults to 0. Never set by onboarding today — net worth is always relative to "since first use," not a true prior balance. |
| `monthly_fixed`, `monthly_variable`, `coffee_per_month`, `subscriptions` | Schema exists; nothing in the app reads or writes these. The Simulator uses static mock data instead (`data/seed.ts`) — see [ARCHITECTURE.md](ARCHITECTURE.md#whats-not-personalized-yet). |
| `persona_id` | Onboarding-selected persona id; also doubles as the "has this user onboarded" flag (`!!profile.persona_id`) in routing. |

### `transactions`

One row per logged expense/income. `amount` is signed (negative = expense, positive = income).
Indexed on `(user_id, occurred_at desc)` for the common "recent activity" / streak-window query
shape.

### `budgets`

One row per user per category (`unique (user_id, category)`). `monthly_limit` only — spend is
always derived live from `transactions`, never stored, so it can't go stale.

### `goals`

`saved` starts at 0 and is only ever incremented through the `contribute_to_goal` RPC (see
below) — there is no other write path, by design, so goal progress can't be forged or drift from
what was actually contributed.

### `achievements`

Static, app-defined catalog — same 9 rows for every user, public read (no `user_id` column, no
per-row RLS filter beyond the table-level policy). See the real ids table above.

### `user_achievements`

Per-user unlock state against the catalog. Composite primary key `(user_id, achievement_id)`.
`progress` is a 0–1 float; `unlocked`/`unlocked_at` are set once and never revert to locked.

## Row Level Security

Every user-owned table (`profiles`, `transactions`, `budgets`, `goals`, `user_achievements`) has
RLS enabled with the same shape:

```sql
create policy "<table>: owner full access" on <table>
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

`achievements` is the one exception — `for select using (true)`, since it's a static public
catalog with no owner column.

**This means the client (anon key + a user's own JWT) has full `UPDATE` rights on every column of
their own `profiles` and `user_achievements` rows**, including `xp`, `streak_days`, `unlocked`,
and `progress` — RLS restricts which *rows* are writable, not which *columns*. Nothing stops a
modified client from calling `supabase.from('profiles').update({xp: 999999})` directly. This is
accepted as a low-severity risk today: the app is single-player, self-forged progress only
affects the forger's own view of their own data, there's no leaderboard or cross-user stakes. See
[SECURITY.md](SECURITY.md#accepted-risk-column-level-write-scope) for the full reasoning and what
would need to change if that stops being true (e.g. a future leaderboard feature).

## Gamification RPCs

All in `supabase/migrations/0003_gamification.sql` / `0004_gamification_fix.sql`. Every one is
`security definer` with `set search_path = public` (prevents search-path hijacking, same pattern
as `delete_own_account`) and computes its effect internally — none of them accept a client-
supplied xp/streak/unlock value. This is the actual enforcement mechanism against the RLS gap
above: even though the client *could* write these columns directly, the app never asks it to —
every legitimate write goes through one of these functions instead.

| Function | Called from | Effect |
|---|---|---|
| `award_transaction_xp()` | After every `addTransaction` | +12 XP; recomputes `streak_days` from real transaction dates (not incremented — see below); evaluates `first-entry`, `week-streak`, `budget-keeper`, `net-worth-climber` |
| `record_goal_created()` | After every `addGoal` (onboarding + New Goal) | Unlocks `goal-starter` if the user has ≥1 goal |
| `contribute_to_goal(p_goal_id, p_amount)` | Goals screen "Add funds" | Increments `goals.saved`; +12 XP; evaluates `goal-halfway` (≥50%) and `goal-crusher` (100%) |
| `record_simulator_run(p_coffee_cut)` | Simulator close, only if a lever moved | Increments `simulator-explorer` progress by 0.2 (5 runs to unlock); unlocks `coffee-cutter` if `p_coffee_cut >= 100` |
| `delete_own_account()` | Profile → Delete account | Deletes the `auth.users` row; every owned table cascades from there |

Two internal helpers (`_unlock_achievement`, `_set_achievement_progress`) back all of the above.
They're `revoke all ... from public` — not directly callable by `authenticated` — but remain
callable *from within* the public entry points above, since a `security definer` function
executes as its owner, and the owner implicitly has execute rights on its own functions.

**Streak is recomputed from scratch on every call, not incremented.** `award_transaction_xp`
walks backward day-by-day from `current_date` counting consecutive days with ≥1 transaction. A
missed call (offline, crash) self-heals on the next successful one instead of drifting — the same
"derive, don't store" principle used for spend and net-worth history.

## Known approximations

Three achievements' real-world copy is more specific than what this schema can verify exactly.
Each is a documented best-effort approximation, not a guess — see the inline comments in
`0004_gamification_fix.sql` for the exact logic:

- **`budget-keeper`** ("stay under budget... for a month") is checked *live*, not at month-end —
  a genuine month-end evaluation would need a scheduled job this project doesn't have. A user
  could unlock it mid-month and later go over.
- **`coffee-cutter`** ("reduce simulated coffee spend to zero") reads the Simulator's `coffeeCut`
  scenario value at close time (unlocks at exactly 100%) — a real, precise signal, not an
  approximation, but worth noting it's a *simulated* commitment, not a tracked real-world habit
  change.
- **`net-worth-climber`** ("grow net worth 3 months running") is approximated as net worth being
  strictly higher live-to-date than at this month's start, than at last month's start, than the
  month before that — a reasonable proxy, not a guarantee of 3 literal calendar-month closes.

`week-streak`'s copy says "open the app 7 days in a row"; there is no app-open tracking anywhere
in this codebase, so it's measured as consecutive days with a *logged transaction* instead — a
stronger signal than a mere app open, and consistent with the rest of the app's habit-loop design.
