-- Lock down SECURITY DEFINER functions so they aren't exposed via PostgREST RPC
-- (security advisors 0028/0029). Trigger functions are invoked only by triggers
-- (no caller EXECUTE needed); RLS helpers must stay executable by `authenticated`
-- for policy evaluation.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.apply_reaction_counts() from public;
revoke execute on function public.apply_comment_count() from public;
revoke execute on function public.apply_comment_vote_counts() from public;

revoke execute on function public.can_see_post(uuid) from public;
revoke execute on function public.is_space_admin(uuid) from public;
revoke execute on function public.is_space_member(uuid) from public;
grant execute on function public.can_see_post(uuid) to authenticated;
grant execute on function public.is_space_admin(uuid) to authenticated;
grant execute on function public.is_space_member(uuid) to authenticated;
