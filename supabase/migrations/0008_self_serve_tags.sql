-- Self-serve feed tags. Tags gain an admin_only flag: a member may add/remove
-- any NON-admin-only tag for themselves; admin_only tags stay admin-controlled.
alter table tags add column admin_only boolean not null default false;

-- Members can read the tag taxonomy in their space (needed to pick feed tags).
create policy tags_member_select on tags for select to authenticated
  using (is_space_member(space_id));

-- Members can read their own tag assignments.
create policy member_tags_self_select on member_tags for select to authenticated
  using (user_id = auth.uid());

-- Members can self-assign a NON-admin-only tag in a space they belong to.
create policy member_tags_self_insert on member_tags for insert to authenticated
  with check (
    user_id = auth.uid()
    and is_space_member(space_id)
    and exists (
      select 1 from tags t
      where t.id = member_tags.tag_id
        and t.space_id = member_tags.space_id
        and t.admin_only = false
    )
  );

-- Members can remove a non-admin-only tag from themselves.
create policy member_tags_self_delete on member_tags for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from tags t
      where t.id = member_tags.tag_id
        and t.admin_only = false
    )
  );
