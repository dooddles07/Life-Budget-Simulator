-- Corrects 0003_gamification.sql. That migration was written against an
-- assumed 'a1'..'a9' achievement catalog (matching data/seed.ts and this
-- repo's own 0001_init.sql seed insert). Verified live against production
-- and neither matches reality: the actual `achievements` table already
-- contains a different, more specific 9-row catalog, seeded outside this
-- repo's migration history at some earlier point:
--
--   first-entry, week-streak, budget-keeper, goal-starter, goal-halfway,
--   goal-crusher, simulator-explorer, coffee-cutter, net-worth-climber
--
-- (three separate goal milestones instead of one "Goal Getter", and
-- coffee-cutter/net-worth-climber mean something more specific than what
-- 0003 checked). Confirmed by 0003 failing on its first real call with
-- `insert or update on table "user_achievements" violates foreign key
-- constraint ... Key (achievement_id)=(a2) is not present`.
--
-- This also fixes a real bug independent of the id mismatch:
-- _set_achievement_progress had no existence guard before inserting into
-- user_achievements, unlike _unlock_achievement -- an unknown id there
-- always foreign-key-violates instead of silently no-op'ing.

create or replace function _set_achievement_progress(p_uid uuid, p_achievement_id text, p_progress numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clamped numeric := least(1, greatest(0, p_progress));
  v_exists boolean;
begin
  select exists(select 1 from achievements where id = p_achievement_id) into v_exists;
  if not v_exists then
    return; -- unknown achievement id, no-op
  end if;

  insert into user_achievements (user_id, achievement_id, unlocked, progress)
    values (p_uid, p_achievement_id, false, v_clamped)
  on conflict (user_id, achievement_id) do update
    set progress = greatest(user_achievements.progress, v_clamped)
    where user_achievements.unlocked is distinct from true;
end;
$$;

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
  v_starting numeric;
  v_net_worth numeric;
  v_nw_this_month numeric;
  v_nw_1mo numeric;
  v_nw_2mo numeric;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update profiles set xp = xp + 12 where id = v_uid;

  -- Streak: consecutive calendar days with >=1 transaction, ending today.
  -- (The real catalog's copy says "open the app 7 days in a row"; there is
  -- no app-open tracking anywhere in this codebase, so a logged-day streak
  -- is the closest real signal -- and matches the habit loop the rest of
  -- the app already builds around, e.g. the Home streak badge.)
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
    perform _unlock_achievement(v_uid, 'first-entry');
  end if;

  perform _set_achievement_progress(v_uid, 'week-streak', v_streak / 7.0);
  if v_streak >= 7 then perform _unlock_achievement(v_uid, 'week-streak'); end if;

  -- budget-keeper (approximation): every envelope with spend this month is
  -- currently at or under its limit, checked live rather than at month-end.
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
    perform _unlock_achievement(v_uid, 'budget-keeper');
  end if;

  select starting_net_worth into v_starting from profiles where id = v_uid;
  select coalesce(v_starting, 0) + coalesce(sum(amount), 0) into v_net_worth
    from transactions where user_id = v_uid;

  select
    v_starting + coalesce(sum(amount) filter (where occurred_at < date_trunc('month', now())), 0),
    v_starting + coalesce(sum(amount) filter (where occurred_at < date_trunc('month', now()) - interval '1 month'), 0),
    v_starting + coalesce(sum(amount) filter (where occurred_at < date_trunc('month', now()) - interval '2 month'), 0)
    into v_nw_this_month, v_nw_1mo, v_nw_2mo
  from transactions where user_id = v_uid;

  -- net-worth-climber (approximation): net worth higher live-to-date than at
  -- this month's start, higher then than at last month's start, and higher
  -- then than the month before that -- growth held for 3 month boundaries.
  if v_net_worth > v_nw_this_month and v_nw_this_month > v_nw_1mo and v_nw_1mo > v_nw_2mo then
    perform _unlock_achievement(v_uid, 'net-worth-climber');
  end if;
end;
$$;

-- Call right after a goal is created (onboarding's first goal, or New Goal).
create or replace function record_goal_created()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select count(*) into v_count from goals where user_id = v_uid;
  if v_count >= 1 then
    perform _unlock_achievement(v_uid, 'goal-starter');
  end if;
end;
$$;

revoke all on function record_goal_created() from public;
grant execute on function record_goal_created() to authenticated;

-- Replaces the old zero-arg version: id fix (simulator-explorer, not a6),
-- plus coffee-cutter, which the real catalog defines as a specific scenario
-- state (coffee lever at 100%) rather than a running counter.
create or replace function record_simulator_run(p_coffee_cut integer default null)
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
    where user_id = v_uid and achievement_id = 'simulator-explorer';

  perform _set_achievement_progress(v_uid, 'simulator-explorer', coalesce(v_progress, 0) + 0.2);

  select progress into v_progress from user_achievements
    where user_id = v_uid and achievement_id = 'simulator-explorer';
  if v_progress >= 1 then
    perform _unlock_achievement(v_uid, 'simulator-explorer');
  end if;

  if p_coffee_cut >= 100 then
    perform _unlock_achievement(v_uid, 'coffee-cutter');
  end if;
end;
$$;

revoke all on function record_simulator_run(integer) from public;
grant execute on function record_simulator_run(integer) to authenticated;
drop function if exists record_simulator_run();

-- Id fix: goal-halfway / goal-crusher instead of a single "a4".
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

  if v_target > 0 and v_saved / v_target >= 0.5 then
    perform _unlock_achievement(v_uid, 'goal-halfway');
  end if;
  if v_saved >= v_target then
    perform _unlock_achievement(v_uid, 'goal-crusher');
  end if;
end;
$$;
