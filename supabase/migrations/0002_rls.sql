-- Memerica — Row-Level Security
-- Apply after 0001_init.sql. RLS enforces the product rules at the DB layer:
--   * everything is scoped to space membership
--   * tags are admin-only (members can't read the tag taxonomy)
--   * a member can only read PUBLISHED posts whose tags overlap the tags the
--     admin assigned them; admins see everything in their space
-- NOTE: verify these policies against the live project before going to prod.

-- ─────────────────────────────────────────────────────────────
-- Visibility helper (security definer → bypasses RLS internally)
-- ─────────────────────────────────────────────────────────────
create or replace function can_see_post(p_post uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from posts p
    join space_members sm on sm.space_id = p.space_id and sm.user_id = auth.uid()
    where p.id = p_post
      and (
        sm.role = 'admin'
        or (
          p.status = 'published'
          and exists (
            select 1
            from post_tags pt
            join member_tags mt on mt.tag_id = pt.tag_id and mt.user_id = auth.uid()
            where pt.post_id = p.id
          )
        )
      )
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Enable RLS
-- ─────────────────────────────────────────────────────────────
alter table profiles       enable row level security;
alter table spaces         enable row level security;
alter table space_members  enable row level security;
alter table tags           enable row level security;
alter table member_tags    enable row level security;
alter table posts          enable row level security;
alter table post_tags      enable row level security;
alter table reactions      enable row level security;
alter table comments       enable row level security;
alter table comment_votes  enable row level security;
alter table invitations    enable row level security;

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
create policy profiles_select on profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from space_members a
      join space_members b on a.space_id = b.space_id
      where a.user_id = auth.uid() and b.user_id = profiles.id
    )
  );
create policy profiles_insert on profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- spaces / membership
-- ─────────────────────────────────────────────────────────────
create policy spaces_select on spaces for select to authenticated
  using (is_space_member(id));

create policy space_members_select on space_members for select to authenticated
  using (is_space_member(space_id));
create policy space_members_admin_write on space_members for all to authenticated
  using (is_space_admin(space_id)) with check (is_space_admin(space_id));

-- ─────────────────────────────────────────────────────────────
-- tags + assignments (admin-only)
-- ─────────────────────────────────────────────────────────────
create policy tags_admin_all on tags for all to authenticated
  using (is_space_admin(space_id)) with check (is_space_admin(space_id));

create policy member_tags_admin_all on member_tags for all to authenticated
  using (is_space_admin(space_id)) with check (is_space_admin(space_id));

-- ─────────────────────────────────────────────────────────────
-- posts + post tags
-- ─────────────────────────────────────────────────────────────
create policy posts_select on posts for select to authenticated
  using (can_see_post(id));
create policy posts_admin_insert on posts for insert to authenticated
  with check (is_space_admin(space_id) and author_id = auth.uid());
create policy posts_admin_update on posts for update to authenticated
  using (is_space_admin(space_id)) with check (is_space_admin(space_id));
create policy posts_admin_delete on posts for delete to authenticated
  using (is_space_admin(space_id));

create policy post_tags_admin_all on post_tags for all to authenticated
  using (exists (select 1 from posts p where p.id = post_id and is_space_admin(p.space_id)))
  with check (exists (select 1 from posts p where p.id = post_id and is_space_admin(p.space_id)));

-- ─────────────────────────────────────────────────────────────
-- reactions (own vote, on a post you can see)
-- ─────────────────────────────────────────────────────────────
create policy reactions_own on reactions for all to authenticated
  using (user_id = auth.uid() and can_see_post(post_id))
  with check (user_id = auth.uid() and can_see_post(post_id));

-- ─────────────────────────────────────────────────────────────
-- comments + comment votes
-- ─────────────────────────────────────────────────────────────
create policy comments_select on comments for select to authenticated
  using (can_see_post(post_id));
create policy comments_insert on comments for insert to authenticated
  with check (author_id = auth.uid() and can_see_post(post_id));
create policy comments_modify_own on comments for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy comments_delete_own on comments for delete to authenticated
  using (author_id = auth.uid());

create policy comment_votes_own on comment_votes for all to authenticated
  using (
    user_id = auth.uid()
    and exists (select 1 from comments c where c.id = comment_id and can_see_post(c.post_id))
  )
  with check (
    user_id = auth.uid()
    and exists (select 1 from comments c where c.id = comment_id and can_see_post(c.post_id))
  );

-- ─────────────────────────────────────────────────────────────
-- invitations (admin-only)
-- ─────────────────────────────────────────────────────────────
create policy invitations_admin_all on invitations for all to authenticated
  using (is_space_admin(space_id)) with check (is_space_admin(space_id));
