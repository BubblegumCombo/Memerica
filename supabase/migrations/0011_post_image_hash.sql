-- Flag duplicate image uploads: store a content hash (SHA-256 hex) of each
-- post's image so the upload screen can warn when the same image is posted
-- again within the space.
alter table posts add column image_hash text;
create index posts_image_hash_idx on posts (space_id, image_hash);
