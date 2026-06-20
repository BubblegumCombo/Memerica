-- Memerica — seed data for a fresh project (run after 0001_init.sql + 0002_rls.sql).
-- Creates the single shared space and its starter tags. Members, posts, and
-- comments accrue from real usage.
--
-- Bootstrap yourself as admin AFTER signing up (run in the SQL editor as your
-- user, or substitute your profiles.id for auth.uid()):
--
--   insert into space_members (space_id, user_id, role)
--   values ('00000000-0000-0000-0000-000000000001', auth.uid(), 'admin')
--   on conflict (space_id, user_id) do update set role = 'admin';

insert into spaces (id, name, invite_code)
values ('00000000-0000-0000-0000-000000000001', 'Banner of Memes', 'bk-4f9a')
on conflict (id) do nothing;

insert into tags (space_id, key, label, dot) values
  ('00000000-0000-0000-0000-000000000001', 'gaming', 'Gaming', '#3b82f6'),
  ('00000000-0000-0000-0000-000000000001', 'anime',  'Anime',  '#ec4899'),
  ('00000000-0000-0000-0000-000000000001', 'truth',  'Truth',  '#eab308'),
  ('00000000-0000-0000-0000-000000000001', 'based',  'Based',  '#22c55e'),
  ('00000000-0000-0000-0000-000000000001', 'cats',   'Cats',   '#f59e0b'),
  ('00000000-0000-0000-0000-000000000001', 'dogs',   'Dogs',   '#06b6d4')
on conflict (space_id, key) do nothing;
