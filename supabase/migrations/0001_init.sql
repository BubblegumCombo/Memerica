-- Memerica — core schema
-- Apply to a NEW, dedicated Supabase project (never the connected one).
-- Run order: 0001_init.sql, then 0002_rls.sql, then optionally seed.sql.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
create type app_role as enum ('admin', 'member');
create type post_kind as enum ('image', 'composed');
create type post_status as enum ('draft', 'published');
create type invite_status as enum ('pending', 'joined');

-- ─────────────────────────────────────────────────────────────
-- Profiles (1:1 with auth.users)
-- ─────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default 'New member',
  initials    text not null default '??',
  color       text not null default '#3b82f6',
  created_at  timestamptz not null default now()
);

-- Create a profile automatically when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display text := coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'New member');
begin
  insert into public.profiles (id, name, initials)
  values (
    new.id,
    display,
    upper(left(regexp_replace(display, '[^A-Za-z0-9]', '', 'g'), 2))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Space + membership (single shared space for v1, modelled for growth)
-- ─────────────────────────────────────────────────────────────
create table spaces (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  invite_code  text not null unique,
  created_by   uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create table space_members (
  space_id   uuid not null references spaces (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  role       app_role not null default 'member',
  joined_at  timestamptz not null default now(),
  primary key (space_id, user_id)
);
create index space_members_user_idx on space_members (user_id);

-- Helper: is the current user an admin of a space?
create or replace function is_space_admin(target_space uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from space_members
    where space_id = target_space and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: is the current user a member (any role) of a space?
create or replace function is_space_member(target_space uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from space_members
    where space_id = target_space and user_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Tags + assignments (admin-only; members never see these)
-- ─────────────────────────────────────────────────────────────
create table tags (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references spaces (id) on delete cascade,
  key        text not null,
  label      text not null,
  dot        text not null default '#3b82f6',
  created_at timestamptz not null default now(),
  unique (space_id, key)
);

create table member_tags (
  space_id  uuid not null references spaces (id) on delete cascade,
  user_id   uuid not null references profiles (id) on delete cascade,
  tag_id    uuid not null references tags (id) on delete cascade,
  primary key (user_id, tag_id)
);
create index member_tags_tag_idx on member_tags (tag_id);

-- ─────────────────────────────────────────────────────────────
-- Posts (memes) + tags
-- ─────────────────────────────────────────────────────────────
create table posts (
  id            uuid primary key default gen_random_uuid(),
  space_id      uuid not null references spaces (id) on delete cascade,
  author_id     uuid references profiles (id) on delete set null,
  kind          post_kind not null,
  image_path    text,            -- S3 key for kind = 'image' (Phase 4)
  compose       jsonb,           -- { bg, watermark, top, bottom } for kind = 'composed'
  caption       text,
  status        post_status not null default 'draft',
  like_count    integer not null default 0,
  dislike_count integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);
create index posts_space_status_idx on posts (space_id, status, created_at desc);

create table post_tags (
  post_id uuid not null references posts (id) on delete cascade,
  tag_id  uuid not null references tags (id) on delete cascade,
  primary key (post_id, tag_id)
);
create index post_tags_tag_idx on post_tags (tag_id);

-- ─────────────────────────────────────────────────────────────
-- Reactions (one vote per user per post) + denormalized counters
-- ─────────────────────────────────────────────────────────────
create table reactions (
  post_id uuid not null references posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  vote    smallint not null check (vote in (-1, 1)),
  primary key (post_id, user_id)
);

create or replace function apply_reaction_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update posts set
      like_count = like_count + (new.vote = 1)::int,
      dislike_count = dislike_count + (new.vote = -1)::int
    where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set
      like_count = like_count - (old.vote = 1)::int,
      dislike_count = dislike_count - (old.vote = -1)::int
    where id = old.post_id;
  elsif tg_op = 'UPDATE' and new.vote <> old.vote then
    update posts set
      like_count = like_count + (new.vote = 1)::int - (old.vote = 1)::int,
      dislike_count = dislike_count + (new.vote = -1)::int - (old.vote = -1)::int
    where id = new.post_id;
  end if;
  return null;
end;
$$;

create trigger reactions_counts
  after insert or update or delete on reactions
  for each row execute function apply_reaction_counts();

-- ─────────────────────────────────────────────────────────────
-- Comments (+ up/down votes) and denormalized counters
-- ─────────────────────────────────────────────────────────────
create table comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  author_id  uuid references profiles (id) on delete set null,
  body       text not null,
  up_count   integer not null default 0,
  down_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index comments_post_idx on comments (post_id, created_at);

create or replace function apply_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set comment_count = comment_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger comments_count
  after insert or delete on comments
  for each row execute function apply_comment_count();

create table comment_votes (
  comment_id uuid not null references comments (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  vote       smallint not null check (vote in (-1, 1)),
  primary key (comment_id, user_id)
);

create or replace function apply_comment_vote_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update comments set
      up_count = up_count + (new.vote = 1)::int,
      down_count = down_count + (new.vote = -1)::int
    where id = new.comment_id;
  elsif tg_op = 'DELETE' then
    update comments set
      up_count = up_count - (old.vote = 1)::int,
      down_count = down_count - (old.vote = -1)::int
    where id = old.comment_id;
  elsif tg_op = 'UPDATE' and new.vote <> old.vote then
    update comments set
      up_count = up_count + (new.vote = 1)::int - (old.vote = 1)::int,
      down_count = down_count + (new.vote = -1)::int - (old.vote = -1)::int
    where id = new.comment_id;
  end if;
  return null;
end;
$$;

create trigger comment_votes_counts
  after insert or update or delete on comment_votes
  for each row execute function apply_comment_vote_counts();

-- ─────────────────────────────────────────────────────────────
-- Invitations
-- ─────────────────────────────────────────────────────────────
create table invitations (
  id          uuid primary key default gen_random_uuid(),
  space_id    uuid not null references spaces (id) on delete cascade,
  email       text not null,
  name        text,
  invited_by  uuid references profiles (id) on delete set null,
  status      invite_status not null default 'pending',
  created_at  timestamptz not null default now()
);
create index invitations_space_idx on invitations (space_id, status);
