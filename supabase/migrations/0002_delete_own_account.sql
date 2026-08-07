-- Lets a signed-in user delete their own account without the service_role
-- key ever touching the client. security definer runs as the function
-- owner (which can write to auth.users); auth.uid() scopes the delete to
-- the caller's own row. profiles/transactions/budgets/goals/user_achievements
-- all reference auth.users(id) on delete cascade (0001_init.sql), so this
-- one delete removes every row the user owns.
create or replace function delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function delete_own_account() from public;
grant execute on function delete_own_account() to authenticated;
