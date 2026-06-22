-- A reply's parent must live on the same post. comments_insert RLS gates the
-- row's own post_id with can_see_post(), but the parent_id FK alone allows a
-- reply to point at a comment on a DIFFERENT post (even one the author cannot
-- see). Enforce parent/post consistency at the DB layer — the real trust
-- boundary, since the REST API bypasses the client UI.
create or replace function enforce_comment_parent_same_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.parent_id is not null then
    if (select post_id from comments where id = new.parent_id) is distinct from new.post_id then
      raise exception 'reply parent must be a comment on the same post';
    end if;
  end if;
  return new;
end;
$$;

create trigger comments_parent_same_post
  before insert or update on comments
  for each row execute function enforce_comment_parent_same_post();

revoke execute on function public.enforce_comment_parent_same_post() from public, anon, authenticated;
