"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  Comment,
  Invitation,
  Member,
  MemberStats,
  Post,
  Space,
  Tag,
  Vote,
} from "@/lib/types";
import type { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { StoreContext, type NewPostInput, type Store } from "./store-context";
import { mapMember, mapPost, mapTag, relativeTime } from "./mappers";

const TAG_PALETTE = [
  "#3b82f6", "#ec4899", "#eab308", "#22c55e", "#f59e0b", "#06b6d4", "#a855f7", "#f97316", "#14b8a6",
];

interface LoadedState {
  uid: string;
  spaceId: string;
  space: Space;
  you: Member;
  members: Member[];
  tags: Tag[];
  tagIdByKey: Record<string, string>;
  posts: Post[];
  comments: Record<string, Comment[]>;
  reactions: Record<string, Vote>;
  invitations: Invitation[];
  youStats: MemberStats;
}

const EMPTY_STORE: Store = {
  space: { id: "", name: "", inviteCode: "" },
  you: { id: "", name: "", initials: "", color: "#3b82f6", role: "member", tagKeys: [] },
  members: [],
  tags: [],
  posts: [],
  invitations: [],
  youStats: { liked: 0, comments: 0, disliked: 0 },
  feed: [],
  getPost: () => undefined,
  getComments: () => [],
  getReaction: () => 0,
  audienceCount: () => 0,
  vote: () => {},
  addComment: () => {},
  voteComment: () => {},
  setRole: () => {},
  createTag: () => "",
  toggleMemberTag: () => {},
  setTagAdminOnly: () => {},
  toggleMyTag: () => {},
  publishPost: () => "",
  addInvitation: () => {},
};

type Client = ReturnType<typeof createClient>;

async function loadAll(supabase: Client, uid: string): Promise<LoadedState> {
  const { data: spaceRow } = await supabase.from("spaces").select("*").limit(1).maybeSingle();
  const space: Space = spaceRow
    ? { id: spaceRow.id, name: spaceRow.name, inviteCode: spaceRow.invite_code }
    : { id: "", name: "Memerica", inviteCode: "" };

  const { data: myMembership } = await supabase
    .from("space_members")
    .select("role")
    .eq("user_id", uid)
    .maybeSingle();
  const myRole: Member["role"] = myMembership?.role ?? "member";
  const isAdmin = myRole === "admin";

  const { data: myProfile } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();

  // Tags (admin-readable). Members get none — they never see tags.
  const { data: tagRows } = await supabase.from("tags").select("*");
  const tagsById = new Map((tagRows ?? []).map((t) => [t.id, t]));
  const tagIdByKey: Record<string, string> = {};
  for (const t of tagRows ?? []) tagIdByKey[t.key] = t.id;

  // My own tag assignments (used for the admin's profile; members can't read these).
  const { data: myTagRows } = await supabase.from("member_tags").select("tag_id").eq("user_id", uid);
  const myTagKeys = (myTagRows ?? [])
    .map((r) => tagsById.get(r.tag_id)?.key)
    .filter((k): k is string => Boolean(k));

  const you: Member = myProfile
    ? mapMember(myProfile, myRole, myTagKeys)
    : { id: uid, name: "You", initials: "YO", color: "#3b82f6", role: myRole, tagKeys: myTagKeys };

  // Other members + their tags (admin only).
  let members: Member[] = [];
  if (isAdmin) {
    const { data: memberRows } = await supabase
      .from("space_members")
      .select("user_id, role")
      .neq("user_id", uid);
    const otherIds = (memberRows ?? []).map((m) => m.user_id);
    const roleByUser = new Map((memberRows ?? []).map((m) => [m.user_id, m.role]));
    const profilesById = new Map<string, NonNullable<typeof myProfile>>();
    const tagKeysByUser = new Map<string, string[]>();
    if (otherIds.length) {
      const { data: profileRows } = await supabase.from("profiles").select("*").in("id", otherIds);
      for (const p of profileRows ?? []) profilesById.set(p.id, p);
      const { data: memberTagRows } = await supabase
        .from("member_tags")
        .select("user_id, tag_id")
        .in("user_id", otherIds);
      for (const mt of memberTagRows ?? []) {
        const key = tagsById.get(mt.tag_id)?.key;
        if (!key) continue;
        const list = tagKeysByUser.get(mt.user_id) ?? [];
        list.push(key);
        tagKeysByUser.set(mt.user_id, list);
      }
    }
    members = otherIds
      .map((id) => {
        const p = profilesById.get(id);
        return p ? mapMember(p, roleByUser.get(id) ?? "member", tagKeysByUser.get(id) ?? []) : null;
      })
      .filter((m): m is Member => m !== null);
  }

  // Published posts (RLS already filters to what the viewer may see).
  const { data: postRows } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  const postIds = (postRows ?? []).map((p) => p.id);

  const tagKeysByPost = new Map<string, string[]>();
  if (postIds.length) {
    const { data: postTagRows } = await supabase
      .from("post_tags")
      .select("post_id, tag_id")
      .in("post_id", postIds);
    for (const pt of postTagRows ?? []) {
      const key = tagsById.get(pt.tag_id)?.key;
      if (!key) continue;
      const list = tagKeysByPost.get(pt.post_id) ?? [];
      list.push(key);
      tagKeysByPost.set(pt.post_id, list);
    }
  }
  const posts = (postRows ?? []).map((p) => mapPost(p, tagKeysByPost.get(p.id) ?? []));

  // My reactions on those posts.
  const reactions: Record<string, Vote> = {};
  if (postIds.length) {
    const { data: reactionRows } = await supabase
      .from("reactions")
      .select("post_id, vote")
      .eq("user_id", uid)
      .in("post_id", postIds);
    for (const r of reactionRows ?? []) reactions[r.post_id] = r.vote === 1 ? 1 : -1;
  }

  // Comments on those posts (+ authors + my comment votes).
  const comments: Record<string, Comment[]> = {};
  let myCommentCount = 0;
  if (postIds.length) {
    const { data: commentRows } = await supabase
      .from("comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });
    const commentIds = (commentRows ?? []).map((c) => c.id);
    const authorIds = Array.from(new Set((commentRows ?? []).map((c) => c.author_id).filter((id): id is string => Boolean(id))));
    const authorById = new Map<string, { name: string; initials: string; color: string }>();
    if (authorIds.length) {
      const { data: authorRows } = await supabase
        .from("profiles")
        .select("id, name, initials, color")
        .in("id", authorIds);
      for (const a of authorRows ?? []) authorById.set(a.id, a);
    }
    const myVoteByComment = new Map<string, Vote>();
    if (commentIds.length) {
      const { data: cvRows } = await supabase
        .from("comment_votes")
        .select("comment_id, vote")
        .eq("user_id", uid)
        .in("comment_id", commentIds);
      for (const cv of cvRows ?? []) myVoteByComment.set(cv.comment_id, cv.vote === 1 ? 1 : -1);
    }
    for (const c of commentRows ?? []) {
      if (c.author_id === uid) myCommentCount++;
      const author = c.author_id ? authorById.get(c.author_id) : undefined;
      const comment: Comment = {
        id: c.id,
        postId: c.post_id,
        parentId: c.parent_id,
        author: author?.name ?? "Member",
        initials: author?.initials ?? "??",
        color: author?.color ?? "#3b82f6",
        text: c.body,
        time: relativeTime(c.created_at),
        up: c.up_count,
        down: c.down_count,
        vote: myVoteByComment.get(c.id) ?? 0,
      };
      (comments[c.post_id] ??= []).push(comment);
    }
  }

  // Invitations (admin only).
  let invitations: Invitation[] = [];
  if (isAdmin) {
    const { data: invRows } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });
    invitations = (invRows ?? []).map((i) => ({
      id: i.id,
      name: i.name ?? undefined,
      email: i.email,
      invitedAt: relativeTime(i.created_at),
      status: i.status,
    }));
  }

  // Tag post counts (published posts carrying each tag).
  const tagPostCount: Record<string, number> = {};
  for (const keys of tagKeysByPost.values()) for (const k of keys) tagPostCount[k] = (tagPostCount[k] ?? 0) + 1;
  const tags = (tagRows ?? []).map((t) => mapTag(t, tagPostCount[t.key] ?? 0));

  const youStats: MemberStats = {
    liked: Object.values(reactions).filter((v) => v === 1).length,
    disliked: Object.values(reactions).filter((v) => v === -1).length,
    comments: myCommentCount,
  };

  return {
    uid,
    spaceId: space.id,
    space,
    you,
    members,
    tags,
    tagIdByKey,
    posts,
    comments,
    reactions,
    invitations,
    youStats,
  };
}

export function SupabaseStoreProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<LoadedState | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "signedout">("loading");

  const stateRef = useRef<LoadedState | null>(null);
  const reloadGenRef = useRef(0);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const isPublic =
    pathname === "/login" ||
    pathname === "/onboarding" ||
    (pathname?.startsWith("/auth") ?? false) ||
    (pathname?.startsWith("/join") ?? false);

  useEffect(() => {
    let active = true;
    const load = async (uid: string) => {
      const loaded = await loadAll(supabase, uid);
      if (!active) return;
      setState(loaded);
      setPhase("ready");
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session?.user) {
        void load(session.user.id);
      } else if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        setState(null);
        setPhase("signedout");
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (phase === "signedout" && !isPublic) router.replace("/login");
  }, [phase, isPublic, router]);

  // ── mutations (optimistic local update + async write) ───────────────────
  const patch = (fn: (s: LoadedState) => LoadedState) =>
    setState((prev) => (prev ? fn(prev) : prev));

  const vote = (postId: string, dir: 1 | -1) => {
    const s = stateRef.current;
    if (!s) return;
    const current = s.reactions[postId] ?? 0;
    patch((st) => {
      const posts = st.posts.map((p) => {
        if (p.id !== postId) return p;
        let like = p.likeCount;
        let dislike = p.dislikeCount;
        if (current === 1) like--;
        if (current === -1) dislike--;
        if (current !== dir) {
          if (dir === 1) like++;
          else dislike++;
        }
        return { ...p, likeCount: like, dislikeCount: dislike };
      });
      const reactions = { ...st.reactions, [postId]: (current === dir ? 0 : dir) as Vote };
      return { ...st, posts, reactions };
    });
    void (async () => {
      if (current === dir) {
        await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", s.uid);
      } else {
        await supabase.from("reactions").upsert({ post_id: postId, user_id: s.uid, vote: dir });
      }
    })().catch((e) => console.error("vote failed", e));
  };

  const addComment = (postId: string, text: string, parentId?: string | null) => {
    const s = stateRef.current;
    const body = text.trim();
    if (!s || !body) return;
    const tempId = `tmp-${crypto.randomUUID()}`;
    // Never persist an unreconciled parent id: a tmp- parent isn't a real uuid,
    // so coerce it to a top-level comment instead of writing a bad FK.
    const safeParentId = parentId && !parentId.startsWith("tmp-") ? parentId : null;
    const comment: Comment = {
      id: tempId,
      postId,
      parentId: safeParentId,
      author: s.you.name,
      initials: s.you.initials,
      color: s.you.color,
      text: body,
      time: "now",
      up: 0,
      down: 0,
      vote: 0,
    };
    patch((st) => ({
      ...st,
      comments: { ...st.comments, [postId]: [...(st.comments[postId] ?? []), comment] },
    }));
    void supabase
      .from("comments")
      .insert({ post_id: postId, author_id: s.uid, body, parent_id: safeParentId })
      .select("id")
      .single()
      .then(({ data }) => {
        if (data) patch((st) => ({
          ...st,
          comments: {
            ...st.comments,
            // Reconcile the temp id, and re-point any optimistic child reply
            // that was attached to it onto the now-real parent id.
            [postId]: (st.comments[postId] ?? []).map((c) =>
              c.id === tempId
                ? { ...c, id: data.id }
                : c.parentId === tempId
                  ? { ...c, parentId: data.id }
                  : c,
            ),
          },
        }));
      })
      .then(undefined, (e) => console.error("addComment failed", e));
  };

  const voteComment = (postId: string, commentId: string, dir: 1 | -1) => {
    const s = stateRef.current;
    if (!s) return;
    const existing = (s.comments[postId] ?? []).find((c) => c.id === commentId);
    const current = existing?.vote ?? 0;
    patch((st) => ({
      ...st,
      comments: {
        ...st.comments,
        [postId]: (st.comments[postId] ?? []).map((c) => {
          if (c.id !== commentId) return c;
          let { up, down } = c;
          if (current === 1) up--;
          if (current === -1) down--;
          if (current !== dir) {
            if (dir === 1) up++;
            else down++;
          }
          return { ...c, up, down, vote: (current === dir ? 0 : dir) as Vote };
        }),
      },
    }));
    if (commentId.startsWith("tmp-")) return; // not yet persisted
    void (async () => {
      if (current === dir) {
        await supabase.from("comment_votes").delete().eq("comment_id", commentId).eq("user_id", s.uid);
      } else {
        await supabase.from("comment_votes").upsert({ comment_id: commentId, user_id: s.uid, vote: dir });
      }
    })().catch((e) => console.error("voteComment failed", e));
  };

  const createTag = (name: string, memberIds: string[]): string => {
    const s = stateRef.current;
    const trimmed = name.trim();
    if (!s || !trimmed) return "";
    const key =
      trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `tag-${crypto.randomUUID().slice(0, 6)}`;
    const tagId = s.tagIdByKey[key] ?? crypto.randomUUID();
    const dot = TAG_PALETTE[s.tags.length % TAG_PALETTE.length];
    patch((st) => ({
      ...st,
      tags: st.tags.some((t) => t.key === key) ? st.tags : [...st.tags, { key, label: trimmed, dot, posts: 0, adminOnly: false }],
      tagIdByKey: { ...st.tagIdByKey, [key]: tagId },
      members: st.members.map((m) =>
        memberIds.includes(m.id) && !m.tagKeys.includes(key) ? { ...m, tagKeys: [...m.tagKeys, key] } : m,
      ),
    }));
    void (async () => {
      await supabase.from("tags").upsert({ id: tagId, space_id: s.spaceId, key, label: trimmed, dot });
      if (memberIds.length) {
        await supabase
          .from("member_tags")
          .upsert(memberIds.map((user_id) => ({ space_id: s.spaceId, user_id, tag_id: tagId })));
      }
    })().catch((e) => console.error("createTag failed", e));
    return key;
  };

  const toggleMemberTag = (memberId: string, tagKey: string) => {
    const s = stateRef.current;
    if (!s) return;
    const tagId = s.tagIdByKey[tagKey];
    const had = s.members.find((m) => m.id === memberId)?.tagKeys.includes(tagKey) ?? false;
    patch((st) => ({
      ...st,
      members: st.members.map((m) =>
        m.id !== memberId
          ? m
          : {
              ...m,
              tagKeys: m.tagKeys.includes(tagKey)
                ? m.tagKeys.filter((t) => t !== tagKey)
                : [...m.tagKeys, tagKey],
            },
      ),
    }));
    if (!tagId) return;
    void (async () => {
      if (had) {
        await supabase.from("member_tags").delete().eq("user_id", memberId).eq("tag_id", tagId);
      } else {
        await supabase.from("member_tags").upsert({ space_id: s.spaceId, user_id: memberId, tag_id: tagId });
      }
    })().catch((e) => console.error("toggleMemberTag failed", e));
  };

  // Member self-assigns/removes a non-admin-only tag, then reloads so the feed
  // (which the DB filters by tag visibility) reflects the change. A generation
  // guard drops stale reloads from rapid toggles; on failure we roll back.
  const toggleMyTag = (tagKey: string) => {
    const s = stateRef.current;
    if (!s) return;
    const tag = s.tags.find((t) => t.key === tagKey);
    if (!tag || tag.adminOnly) return;
    const tagId = s.tagIdByKey[tagKey];
    const had = s.you.tagKeys.includes(tagKey);
    const before = s.you.tagKeys;
    const setMine = (keys: string[]) => patch((st) => ({ ...st, you: { ...st.you, tagKeys: keys } }));
    setMine(had ? before.filter((t) => t !== tagKey) : [...before, tagKey]);
    if (!tagId) return;
    const gen = ++reloadGenRef.current;
    void (async () => {
      const res = had
        ? await supabase.from("member_tags").delete().eq("user_id", s.uid).eq("tag_id", tagId)
        : await supabase.from("member_tags").upsert({ space_id: s.spaceId, user_id: s.uid, tag_id: tagId });
      if (res.error) throw res.error;
      const loaded = await loadAll(supabase, s.uid);
      if (gen === reloadGenRef.current) setState(loaded); // ignore a stale reload
    })().catch((e) => {
      console.error("toggleMyTag failed", e);
      if (gen === reloadGenRef.current) setMine(before); // revert the optimistic change
    });
  };

  const setTagAdminOnly = (tagKey: string, adminOnly: boolean) => {
    const s = stateRef.current;
    if (!s) return;
    const tagId = s.tagIdByKey[tagKey];
    patch((st) => ({
      ...st,
      tags: st.tags.map((t) => (t.key === tagKey ? { ...t, adminOnly } : t)),
    }));
    if (!tagId) return;
    void supabase
      .from("tags")
      .update({ admin_only: adminOnly })
      .eq("id", tagId)
      .then(undefined, (e) => console.error("setTagAdminOnly failed", e));
  };

  const publishPost = (input: NewPostInput): string => {
    const s = stateRef.current;
    if (!s) return "";
    const id = crypto.randomUUID();
    const published = input.status === "published";
    const post: Post = {
      id,
      kind: input.kind,
      imageUrl: input.kind === "image" ? input.imageUrl : undefined,
      compose: input.kind === "composed" ? input.compose : undefined,
      caption: input.caption?.trim() || undefined,
      tagKeys: input.tagKeys,
      status: input.status,
      likeCount: 0,
      dislikeCount: 0,
      createdAt: new Date().toISOString(),
    };
    if (published) {
      patch((st) => ({
        ...st,
        posts: [post, ...st.posts],
        tags: st.tags.map((t) => (input.tagKeys.includes(t.key) ? { ...t, posts: t.posts + 1 } : t)),
      }));
    }
    void (async () => {
      await supabase.from("posts").insert({
        id,
        space_id: s.spaceId,
        author_id: s.uid,
        kind: input.kind,
        image_path: input.kind === "image" ? input.imageKey ?? null : null,
        compose: (input.kind === "composed" ? input.compose ?? null : null) as Json,
        caption: input.caption?.trim() || null,
        status: input.status,
        published_at: published ? new Date().toISOString() : null,
      });
      const tagIds = input.tagKeys.map((k) => s.tagIdByKey[k]).filter((x): x is string => Boolean(x));
      if (tagIds.length) {
        await supabase.from("post_tags").upsert(tagIds.map((tag_id) => ({ post_id: id, tag_id })));
      }
    })().catch((e) => console.error("publishPost failed", e));
    return id;
  };

  const addInvitation = (email: string, name?: string) => {
    const s = stateRef.current;
    const trimmed = email.trim();
    if (!s || !trimmed) return;
    const id = crypto.randomUUID();
    patch((st) => ({
      ...st,
      invitations: [
        { id, email: trimmed, name: name?.trim() || undefined, invitedAt: "just now", status: "pending" },
        ...st.invitations,
      ],
    }));
    void supabase
      .from("invitations")
      .insert({ id, space_id: s.spaceId, email: trimmed, name: name?.trim() || null, invited_by: s.uid })
      .then(undefined, (e) => console.error("addInvitation failed", e));
  };

  const value: Store = useMemo(() => {
    if (!state) return EMPTY_STORE;
    return {
      space: state.space,
      you: state.you,
      members: state.members,
      tags: state.tags,
      posts: state.posts,
      invitations: state.invitations,
      youStats: state.youStats,
      feed: state.posts,
      getPost: (id) => state.posts.find((p) => p.id === id),
      getComments: (postId) => state.comments[postId] ?? [],
      getReaction: (postId) => state.reactions[postId] ?? 0,
      audienceCount: (tagKeys) =>
        state.members.filter((m) => m.tagKeys.some((t) => tagKeys.includes(t))).length,
      vote,
      addComment,
      voteComment,
      setRole: () => {},
      createTag,
      toggleMemberTag,
      setTagAdminOnly,
      toggleMyTag,
      publishPost,
      addInvitation,
    };
    // mutation closures read latest via stateRef, so they don't need to be deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const showLoader = !isPublic && phase !== "ready";

  return (
    <StoreContext.Provider value={value}>
      {showLoader ? (
        <div className="flex min-h-[100dvh] items-center justify-center bg-app text-muted">
          <span className="text-sm">Loading…</span>
        </div>
      ) : (
        children
      )}
    </StoreContext.Provider>
  );
}
