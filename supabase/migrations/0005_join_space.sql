-- Invite/join flow. A space's invite_code is the gate: anyone with the link can
-- join. space_name_for_code lets the /join page greet invitees before sign-in;
-- join_space adds the authenticated caller as a member and flips a matching
-- pending invitation to joined.

create or replace function space_name_for_code(p_code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select name from spaces where invite_code = p_code;
$$;

create or replace function join_space(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space_id uuid;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'must be signed in to join';
  end if;

  select id into v_space_id from spaces where invite_code = p_code;
  if v_space_id is null then
    raise exception 'invalid invite code';
  end if;

  insert into space_members (space_id, user_id, role)
  values (v_space_id, auth.uid(), 'member')
  on conflict (space_id, user_id) do nothing;

  select email into v_email from auth.users where id = auth.uid();
  if v_email is not null then
    update invitations
      set status = 'joined'
      where space_id = v_space_id and lower(email) = lower(v_email) and status = 'pending';
  end if;

  return v_space_id;
end;
$$;

-- Exposure: name lookup is anon-callable (the code is the gate); joining is
-- authenticated-only.
revoke execute on function space_name_for_code(text) from public;
grant execute on function space_name_for_code(text) to anon, authenticated;

revoke execute on function join_space(text) from public, anon, authenticated;
grant execute on function join_space(text) to authenticated;
