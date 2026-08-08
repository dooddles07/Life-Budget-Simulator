-- Two hardening fixes, independent of the id-catalog fix in 0004:
--
-- 1. _unlock_achievement had a check-then-act race: the "already unlocked?"
--    select and the insert/update-on-conflict were two separate statements,
--    so two concurrent calls (flaky retry, rapid double-tap) could both pass
--    the guard and each run `update profiles set xp = xp + v_xp`, double-
--    awarding XP for a single achievement. Fixed by gating the XP award on
--    whether the insert/update actually changed a row (via GET DIAGNOSTICS),
--    which is safe under concurrency because the ON CONFLICT clause takes a
--    row-level lock for the duration of the statement.
--
-- 2. profiles/user_achievements RLS is "owner full access" (table-level),
--    so an authenticated client could previously bypass every RPC above and
--    directly `.update()` profiles.xp / streak_days / user_achievements.
--    unlocked / progress to arbitrary values. The client never legitimately
--    writes those columns (upsertProfile only ever sends name/persona_id/
--    monthly_income/etc, verified against every call site), so column-level
--    grants now restrict direct client updates to the non-gamification
--    columns; the gamification columns can only change via these
--    security-definer functions, which run as the function owner and are
--    unaffected by grants on the calling role.

create or replace function _unlock_achievement(p_uid uuid, p_achievement_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_xp integer;
  v_rows integer;
begin
  select xp into v_xp from achievements where id = p_achievement_id;
  if v_xp is null then
    return; -- unknown achievement id, no-op
  end if;

  insert into user_achievements (user_id, achievement_id, unlocked, progress, unlocked_at)
    values (p_uid, p_achievement_id, true, 1, now())
  on conflict (user_id, achievement_id) do update
    set unlocked = true, progress = 1, unlocked_at = now()
    where user_achievements.unlocked is distinct from true;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return; -- was already unlocked; no XP on a repeat call
  end if;

  update profiles set xp = xp + v_xp where id = p_uid;
end;
$$;

revoke all on function _unlock_achievement(uuid, text) from public;

-- Lock down direct client writes to server-computed columns. Table-level
-- grants from the initial Supabase project setup gave `authenticated` ALL
-- privileges on every public table; RLS restricts by row, not by column, so
-- this is the layer that actually closes the gap.
revoke update on profiles from authenticated;
grant update (
  name, handle, starting_net_worth, monthly_income, monthly_fixed,
  monthly_variable, coffee_per_month, persona_id, subscriptions
) on profiles to authenticated;

revoke insert, update, delete on user_achievements from authenticated;
