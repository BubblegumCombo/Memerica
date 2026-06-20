-- Supabase grants EXECUTE to anon/authenticated explicitly (not only via PUBLIC),
-- so revoke-from-public alone left them exposed. Revoke the explicit grants:
-- trigger functions from both roles (triggers don't need caller EXECUTE); RLS
-- helpers from anon only (authenticated must keep EXECUTE for policy evaluation).

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.apply_reaction_counts() from anon, authenticated;
revoke execute on function public.apply_comment_count() from anon, authenticated;
revoke execute on function public.apply_comment_vote_counts() from anon, authenticated;

revoke execute on function public.can_see_post(uuid) from anon;
revoke execute on function public.is_space_admin(uuid) from anon;
revoke execute on function public.is_space_member(uuid) from anon;
