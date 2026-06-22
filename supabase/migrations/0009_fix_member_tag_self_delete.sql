-- Mirror member_tags_self_insert on the delete policy. The original delete
-- policy dropped two guards the insert enforces: space membership and the
-- tag/space correlation. A member may only remove their OWN assignment of a
-- NON-admin-only tag in a space they belong to.
drop policy member_tags_self_delete on member_tags;
create policy member_tags_self_delete on member_tags for delete to authenticated
  using (
    user_id = auth.uid()
    and is_space_member(space_id)
    and exists (
      select 1 from tags t
      where t.id = member_tags.tag_id
        and t.space_id = member_tags.space_id
        and t.admin_only = false
    )
  );
