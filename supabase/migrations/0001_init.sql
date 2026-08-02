-- Life Budget Simulator: initial schema.
-- Static UI metadata (category icon/label/swatch, achievement icon) stays in
-- client code (data/categories.ts, data/achievements.ts) -- the DB only
-- stores the ids and per-user data. weekly_spend / net_worth history are
-- derived from transactions at query time, not stored, so they can never
-- drift out of sync the way the old static mock data did.

create type category_id as enum (
  'food', 'transport', 'housing', 'fun', 'shopping', 'health', 'bills', 'learning'
);

-- One row per authenticated user, keyed to auth.users. Created on signup by
-- the app (not a trigger) so onboarding can write persona/income/goal in one
-- upsert alongside profile creation.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  handle text not null default '',
  xp integer not null default 0,
  streak_days integer not null default 0,
  starting_net_worth numeric not null default 0,
  monthly_income numeric not null default 0,
  monthly_fixed numeric not null default 0,
  monthly_variable numeric not null default 0,
  coffee_per_month numeric not null default 0,
  persona_id text,
  subscriptions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  merchant text not null default '',
  amount numeric not null,
  category category_id not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index transactions_user_occurred_idx on transactions (user_id, occurred_at desc);

-- "limit" only -- spend is derived from transactions, never stored, so it
-- can't go stale the way the mock data's static `spent` field did.
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category category_id not null,
  monthly_limit numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target numeric not null,
  saved numeric not null default 0,
  monthly numeric not null default 0,
  icon text not null default 'target',
  accent_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Static, app-defined achievement catalog -- same rows for every user.
-- Public read, no RLS user filter.
create table achievements (
  id text primary key,
  title text not null,
  detail text not null,
  icon text not null,
  xp integer not null default 0
);

-- Per-user unlock/progress against the static catalog above.
create table user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references achievements (id) on delete cascade,
  unlocked boolean not null default false,
  progress numeric not null default 0,
  unlocked_at timestamptz,
  primary key (user_id, achievement_id)
);

-- Row Level Security: every user-owned table is isolated to auth.uid().
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;

create policy "profiles: owner full access" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "transactions: owner full access" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets: owner full access" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals: owner full access" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "achievements: public read" on achievements
  for select using (true);

create policy "user_achievements: owner full access" on user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed the static achievement catalog (mirrors data/seed.ts ACHIEVEMENTS ids/titles).
insert into achievements (id, title, detail, icon, xp) values
  ('first-entry', 'First entry', 'Log your first transaction', 'sparkles', 10),
  ('week-streak', '7-day streak', 'Open the app 7 days in a row', 'flame', 25),
  ('budget-keeper', 'Budget keeper', 'Stay under budget in every category for a month', 'shield-check', 50),
  ('goal-starter', 'Goal starter', 'Create your first savings goal', 'target', 10),
  ('goal-halfway', 'Halfway there', 'Reach 50% of a savings goal', 'trending-up', 20),
  ('goal-crusher', 'Goal crusher', 'Fully fund a savings goal', 'trophy', 50),
  ('simulator-explorer', 'Simulator explorer', 'Run 5 what-if scenarios', 'sliders', 15),
  ('coffee-cutter', 'Coffee cutter', 'Reduce simulated coffee spend to zero', 'coffee', 15),
  ('net-worth-climber', 'Net worth climber', 'Grow net worth 3 months running', 'line-chart', 30);
