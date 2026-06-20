// Hand-authored to match supabase/migrations. REPLACE with generated types once
// the project exists:  supabase gen types typescript --project-id <id> > lib/database.types.ts

export type AppRole = "admin" | "member";
export type PostKind = "image" | "composed";
export type PostStatus = "draft" | "published";
export type InviteStatus = "pending" | "joined";

type Timestamp = string;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string; initials: string; color: string; created_at: Timestamp };
        Insert: { id: string; name?: string; initials?: string; color?: string; created_at?: Timestamp };
        Update: { id?: string; name?: string; initials?: string; color?: string; created_at?: Timestamp };
        Relationships: [];
      };
      spaces: {
        Row: { id: string; name: string; invite_code: string; created_by: string | null; created_at: Timestamp };
        Insert: { id?: string; name: string; invite_code: string; created_by?: string | null; created_at?: Timestamp };
        Update: { id?: string; name?: string; invite_code?: string; created_by?: string | null; created_at?: Timestamp };
        Relationships: [];
      };
      space_members: {
        Row: { space_id: string; user_id: string; role: AppRole; joined_at: Timestamp };
        Insert: { space_id: string; user_id: string; role?: AppRole; joined_at?: Timestamp };
        Update: { space_id?: string; user_id?: string; role?: AppRole; joined_at?: Timestamp };
        Relationships: [];
      };
      tags: {
        Row: { id: string; space_id: string; key: string; label: string; dot: string; created_at: Timestamp };
        Insert: { id?: string; space_id: string; key: string; label: string; dot?: string; created_at?: Timestamp };
        Update: { id?: string; space_id?: string; key?: string; label?: string; dot?: string; created_at?: Timestamp };
        Relationships: [];
      };
      member_tags: {
        Row: { space_id: string; user_id: string; tag_id: string };
        Insert: { space_id: string; user_id: string; tag_id: string };
        Update: { space_id?: string; user_id?: string; tag_id?: string };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string; space_id: string; author_id: string | null; kind: PostKind;
          image_path: string | null; compose: MemeComposeJson | null; caption: string | null;
          status: PostStatus; like_count: number; dislike_count: number; comment_count: number;
          created_at: Timestamp; published_at: Timestamp | null;
        };
        Insert: {
          id?: string; space_id: string; author_id?: string | null; kind: PostKind;
          image_path?: string | null; compose?: MemeComposeJson | null; caption?: string | null;
          status?: PostStatus; like_count?: number; dislike_count?: number; comment_count?: number;
          created_at?: Timestamp; published_at?: Timestamp | null;
        };
        Update: {
          status?: PostStatus; caption?: string | null; image_path?: string | null;
          compose?: MemeComposeJson | null; published_at?: Timestamp | null;
        };
        Relationships: [];
      };
      post_tags: {
        Row: { post_id: string; tag_id: string };
        Insert: { post_id: string; tag_id: string };
        Update: { post_id?: string; tag_id?: string };
        Relationships: [];
      };
      reactions: {
        Row: { post_id: string; user_id: string; vote: number };
        Insert: { post_id: string; user_id: string; vote: number };
        Update: { vote?: number };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string; post_id: string; author_id: string | null; body: string;
          up_count: number; down_count: number; created_at: Timestamp;
        };
        Insert: { id?: string; post_id: string; author_id?: string | null; body: string; created_at?: Timestamp };
        Update: { body?: string };
        Relationships: [];
      };
      comment_votes: {
        Row: { comment_id: string; user_id: string; vote: number };
        Insert: { comment_id: string; user_id: string; vote: number };
        Update: { vote?: number };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string; space_id: string; email: string; name: string | null;
          invited_by: string | null; status: InviteStatus; created_at: Timestamp;
        };
        Insert: { id?: string; space_id: string; email: string; name?: string | null; invited_by?: string | null; status?: InviteStatus; created_at?: Timestamp };
        Update: { status?: InviteStatus; name?: string | null };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_space_admin: { Args: { target_space: string }; Returns: boolean };
      is_space_member: { Args: { target_space: string }; Returns: boolean };
      can_see_post: { Args: { p_post: string }; Returns: boolean };
    };
    Enums: {
      app_role: AppRole;
      post_kind: PostKind;
      post_status: PostStatus;
      invite_status: InviteStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}

export interface MemeComposeJson {
  bg: string;
  watermark: string;
  top: string;
  bottom: string;
}
