-- Hygiene, not a vulnerability fix: each of these RPCs already checks
-- auth.uid() internally and raises if null, so anon calling them just
-- errors -- not exploitable. Revoking anon's EXECUTE here is pure
-- attack-surface reduction; authenticated keeps full access.
revoke execute on function award_transaction_xp() from anon;
revoke execute on function contribute_to_goal(uuid, numeric) from anon;
revoke execute on function record_goal_created() from anon;
revoke execute on function record_simulator_run(integer) from anon;
revoke execute on function delete_own_account() from anon;
