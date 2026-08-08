-- Least-privilege cleanup, found while verifying 0005 against the live
-- project: Supabase's default project bootstrap grants `anon` full
-- INSERT/UPDATE/DELETE/TRUNCATE and `authenticated` TRUNCATE on every public
-- table. Nothing in this app uses either:
--
-- - `anon` never reaches a write in practice (every screen that touches the
--   DB sits behind app/_layout.tsx's Stack.Protected auth gate, and every
--   RLS policy is scoped to `user_id = auth.uid()`, which is NULL for an
--   unauthenticated request -- so the row-security check already fails
--   these). This just removes the now-provably-dead grant.
-- - TRUNCATE bypasses row level security entirely (it is not a row-level
--   operation), so it is the one privilege here RLS does not cover for
--   either role. Not reachable through PostgREST/supabase-js today (no
--   TRUNCATE verb exists in that API), but there is no legitimate use for
--   either role to hold it, so it goes too.
--
-- `anon` keeps SELECT on `achievements` (the "public read" catalog table,
-- intentional per 0001_init.sql) and loses nothing else it was using.

revoke truncate on transactions, budgets, goals, profiles, achievements, user_achievements
  from anon, authenticated;

revoke insert, update, delete on transactions, budgets, goals, profiles, achievements, user_achievements
  from anon;

-- achievements has RLS enabled with only a SELECT policy ("achievements:
-- public read", using(true)); no INSERT/UPDATE/DELETE policy exists, so
-- Postgres RLS already default-denies those commands for every non-owner
-- role. authenticated's table-level write grant here was exactly as dead as
-- anon's were above -- same cleanup, same reasoning.
revoke insert, update, delete on achievements from authenticated;
