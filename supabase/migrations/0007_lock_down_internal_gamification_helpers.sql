-- CRITICAL: _unlock_achievement and _set_achievement_progress are internal
-- helpers meant to be called only via `perform` from the public-facing RPCs
-- (award_transaction_xp, contribute_to_goal, record_goal_created,
-- record_simulator_run) -- never directly. Both take p_uid as a caller-
-- supplied parameter with no check that p_uid = auth.uid(), because they
-- were never meant to be reachable by an external caller in the first
-- place.
--
-- 0003_gamification.sql's `revoke all on function ... from public` did not
-- actually close this: Supabase's project-default privileges grant EXECUTE
-- directly to the named anon/authenticated roles at function-creation time,
-- and REVOKE ... FROM PUBLIC only removes the separate PUBLIC pseudo-grant,
-- not those direct role grants. Confirmed live via
-- information_schema.role_routine_grants: both anon and authenticated held
-- direct EXECUTE on both functions, meaning any client -- even fully
-- unauthenticated, using only the public anon key -- could call
-- /rest/v1/rpc/_unlock_achievement with an arbitrary p_uid and unlock any
-- achievement (plus its XP) for any user, not just themselves. Same for
-- _set_achievement_progress.
--
-- Revoking direct EXECUTE here does not affect the legitimate internal
-- `perform _unlock_achievement(...)` calls inside the public RPCs: those
-- run under the calling (outer) SECURITY DEFINER function's definer
-- privileges, not the original external caller's grants.

revoke execute on function _unlock_achievement(uuid, text) from public, anon, authenticated;
revoke execute on function _set_achievement_progress(uuid, text, numeric) from public, anon, authenticated;
