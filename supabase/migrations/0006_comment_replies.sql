-- Comment replies: a comment can reference a parent comment on the same post.
-- Top-level comments have parent_id = null; replies point at the comment they
-- answer. Existing comments_insert/comments_select RLS already gates by post +
-- author, so no policy change is needed. on delete cascade removes a parent's
-- replies along with it.
alter table comments
  add column parent_id uuid references comments (id) on delete cascade;

create index comments_parent_idx on comments (parent_id);
