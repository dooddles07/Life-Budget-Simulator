-- Server-side gamification: XP, login streak, and achievement unlocks are
-- computed and written here, never by the client. A modified client can
-- still call these RPCs, but can only trigger the fixed, real logic below --
-- it can never set xp/streak_days/unlocked to an arbitrary value directly,
-- unlike a raw client `.update()` against profiles/user_achievements would
-- allow under the existing "owner full access" RLS policy (0001_init.sql).
--
-- Streak is recomputed from real transaction dates on every call rather than
-- incremented, so a missed call (offline, crash) self-heals on the next one
-- instead of drifting -- same "derive, don't store" reasoning already used
-- for budget spend and net worth history.
--
-- Achievements a3 (Under Budget), a5 (Coffee Quitter), a6 (Simulator), and a9
-- (Debt Free) reference product mechanics this schema has no real signal
-- for (a month-end job, a "skipped a purchase" event, persisted Simulator
-- runs, and a liabilities concept, respectively). The logic below is a
-- best-effort approximation from data that does exist; see inline comments.

create or replace function _unlock_achievement(p_uid uuid, p_achievement_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_xp integer;
  v_already boolean;
begin
  select unlocked into v_already from user_achievements
    where user_id = p_uid and achievement_id = p_achievement_id;

  if v_already is true then
    return;
  end if;

  select xp into v_xp from achievements where id = p_achievement_id;
  if v_xp is null then
    return; -- unknown achievement id, no-op
  end if;

  insert into user_achievements (user_id, achievement_id, unlocked, progress, unlocked_at)
    values (p_uid, p_achievement_id, true, 1, now())
  on conflict (user_id, achievement_id) do update
    set unlocked = true, progress = 1, unlocked_at = now()
    where user_achievements.unlocked is distinct from true;

  update profiles set xp = xp + v_xp where id = p_uid;
end;
$$;

revoke all on function _unlock_achievement(uuid, text) from public;

create or replace function _set_achievement_progress(p_uid uuid, p_achievement_id text, p_progress numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clamped numeric := least(1, greatest(0, p_progress));
begin
  insert into user_achievements (user_id, achievement_id, unlocked, progress)
    values (p_uid, p_achievement_id, false, v_clamped)
  on conflict (user_id, achievement_id) do update
    set progress = greatest(user_achievements.progress, v_clamped)
    where user_achievements.unlocked is distinct from true;
end;
$$;

revoke all on function _set_achievement_progress(uuid, text, numeric) from public;

-- Call once, right after a transaction insert succeeds.
create or replace function award_transaction_xp()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_streak integer := 0;
  v_cursor date := current_date;
  v_has_day boolean;
  v_tx_count integer;
  v_over_budget boolean;
  v_days_no_food integer;
  v_starting numeric;
  v_net_worth numeric;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update profiles set xp = xp + 12 where id = v_uid;

  -- Streak: consecutive calendar days with >=1 transaction, ending today.
  loop
    select exists(
      select 1 from transactions
      where user_id = v_uid and occurred_at::date = v_cursor
    ) into v_has_day;
    exit when not v_has_day;
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
  end loop;
  update profiles set streak_days = v_streak where id = v_uid;

  select count(*) into v_tx_count from transactions where user_id = v_uid;
  if v_tx_count >= 1 then
    perform _unlock_achievement(v_uid, 'a1');
  end if;

  perform _set_achievement_progress(v_uid, 'a2', v_streak / 7.0);
  if v_streak >= 7 then perform _unlock_achievement(v_uid, 'a2'); end if;
  perform _set_achievement_progress(v_uid, 'a7', v_streak / 30.0);
  if v_streak >= 30 then perform _unlock_achievement(v_uid, 'a7'); end if;

  -- a3 (approximation): every envelope with spend this month is currently at
  -- or under its limit. A user with zero budgets yet never unlocks this.
  select bool_and(b.monthly_limit >= coalesce(s.spent, 0)) into v_over_budget
  from budgets b
  left join (
    select category, sum(-amount) as spent
    from transactions
    where user_id = v_uid and amount < 0 and occurred_at >= date_trunc('month', now())
    group by category
  ) s on s.category = b.category
  where b.user_id = v_uid;
  if v_over_budget is true then
    perform _unlock_achievement(v_uid, 'a3');
  end if;

  -- a5 (approximation): "skipping a coffee run" isn't itself a loggable
  -- event, so this reads as days with any activity but no food-category spend.
  select count(*) into v_days_no_food from (
    select occurred_at::date as d from transactions where user_id = v_uid
    except
    select occurred_at::date as d from transactions where user_id = v_uid and category = 'food'
  ) x;
  perform _set_achievement_progress(v_uid, 'a5', v_days_no_food / 10.0);
  if v_days_no_food >= 10 then
    perform _unlock_achievement(v_uid, 'a5');
  end if;

  select starting_net_worth into v_starting from profiles where id = v_uid;
  select coalesce(v_starting, 0) + coalesce(sum(amount), 0) into v_net_worth
    from transactions where user_id = v_uid;

  if v_net_worth >= 100000 then
    perform _unlock_achievement(v_uid, 'a8');
  end if;

  -- a9 (approximation): no liability concept exists in this schema, so this
  -- reads as "net worth has never gone negative."
  if v_net_worth >= 0 then
    perform _unlock_achievement(v_uid, 'a9');
  end if;
end;
$$;

revoke all on function award_transaction_xp() from public;
grant execute on function award_transaction_xp() to authenticated;

-- Call when the user closes the Simulator having actually moved a lever.
-- a6 (approximation): Simulator scenarios are never persisted (pure client
-- state), so "ran 5 what-ifs" is tracked as 5 closes-with-a-touched-lever.
create or replace function record_simulator_run()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_progress numeric;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select progress into v_progress from user_achievements
    where user_id = v_uid and achievement_id = 'a6';

  perform _set_achievement_progress(v_uid, 'a6', coalesce(v_progress, 0) + 0.2);

  select progress into v_progress from user_achievements
    where user_id = v_uid and achievement_id = 'a6';
  if v_progress >= 1 then
    perform _unlock_achievement(v_uid, 'a6');
  end if;
end;
$$;

revoke all on function record_simulator_run() from public;
grant execute on function record_simulator_run() to authenticated;

-- Adds funds to one of the caller's own goals. A dedicated RPC (rather than a
-- direct client update to `saved`) keeps the write server-validated and lets
-- it award XP / evaluate Goal Getter atomically in the same call.
create or replace function contribute_to_goal(p_goal_id uuid, p_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target numeric;
  v_saved numeric;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  update goals set saved = saved + p_amount
    where id = p_goal_id and user_id = v_uid
    returning target, saved into v_target, v_saved;

  if not found then
    raise exception 'goal not found';
  end if;

  update profiles set xp = xp + 12 where id = v_uid;

  if v_saved >= v_target then
    perform _unlock_achievement(v_uid, 'a4');
  end if;
end;
$$;

revoke all on function contribute_to_goal(uuid, numeric) from public;
grant execute on function contribute_to_goal(uuid, numeric) to authenticated;
