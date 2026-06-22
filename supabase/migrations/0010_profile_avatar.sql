-- Members can set a profile picture. avatar_path is the S3 object key; the app
-- serves it through the CDN. The existing profiles_update policy (id =
-- auth.uid()) already lets a member update only their own row.
alter table profiles add column avatar_path text;
