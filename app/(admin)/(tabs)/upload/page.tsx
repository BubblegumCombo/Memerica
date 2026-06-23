"use client";

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { MemeCompose } from "@/lib/types";
import { useStore } from "@/lib/data/store";
import { AdminTopBar } from "@/components/AdminTopBar";
import { MemeComposer } from "@/components/MemeComposer";
import { Avatar } from "@/components/Avatar";
import { PlusIcon } from "@/components/icons";
import { uploadImage } from "@/lib/upload";

const DEFAULT_COMPOSE: MemeCompose = { bg: "#111111", watermark: "", top: "", bottom: "" };
const GREEN = "#22c55e";

/** SHA-256 hex of a file's bytes — used to detect a re-upload of the same image. */
async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function UploadPage() {
  const { tags, members, posts, createTag, publishPost } = useStore();
  const router = useRouter();

  const [mode, setMode] = useState<"compose" | "upload">("upload");
  const [compose, setCompose] = useState<MemeCompose>(DEFAULT_COMPOSE);

  // Compose mode: a single image with top/bottom captions.
  const [composeFile, setComposeFile] = useState<File | null>(null);
  const [composeUrl, setComposeUrl] = useState<string | undefined>(undefined);

  // Upload mode: a queue of images, published one at a time with their own tags.
  const [batch, setBatch] = useState<{ file: File; url: string }[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);

  const [selected, setSelected] = useState<string[]>(["based", "gaming"]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashInfo, setHashInfo] = useState<{ file: File; hash: string } | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ file: File; tooLong: boolean } | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMembers, setNewMembers] = useState<string[]>([]);

  const current = batch[batchIndex];
  const remaining = mode === "upload" ? Math.max(0, batch.length - batchIndex - 1) : 0;

  const activeFile = mode === "compose" ? composeFile : current?.file;
  // Only trust each derived value once it belongs to the file currently shown.
  const activeHash = hashInfo && hashInfo.file === activeFile ? hashInfo.hash : null;
  const dupWarning = activeHash !== null && posts.some((p) => p.imageHash === activeHash);
  const videoTooLong = videoInfo && videoInfo.file === activeFile ? videoInfo.tooLong : false;
  const canPublish =
    (mode === "compose" ? Boolean(composeFile) : Boolean(current)) && !videoTooLong;

  // Hash the active file so we can flag a re-upload of the same image/video.
  useEffect(() => {
    if (!activeFile) return;
    let cancelled = false;
    hashFile(activeFile).then((hash) => {
      if (!cancelled) setHashInfo({ file: activeFile, hash });
    });
    return () => {
      cancelled = true;
    };
  }, [activeFile]);

  // Reject videos longer than a minute (checked client-side via metadata).
  useEffect(() => {
    if (!activeFile || !activeFile.type.startsWith("video/")) return;
    const url = URL.createObjectURL(activeFile);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      setVideoInfo({ file: activeFile, tooLong: v.duration > 60.5 });
      URL.revokeObjectURL(url);
    };
    v.src = url;
    return () => URL.revokeObjectURL(url);
  }, [activeFile]);

  const matchedMembers = members.filter((m) => m.tagKeys.some((t) => selected.includes(t)));
  const audienceLine =
    matchedMembers.map((m) => m.name).concat(["you"]).slice(0, 4).join(", ") +
    (matchedMembers.length > 3 ? " …" : "");
  const tagLabels = selected.map((k) => "#" + k).join(" ") || "no tags yet";

  function toggleTag(k: string) {
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }
  function pickComposeImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setComposeFile(f);
      setComposeUrl(URL.createObjectURL(f));
    }
  }
  function clearComposeImage() {
    if (composeUrl) URL.revokeObjectURL(composeUrl);
    setComposeFile(null);
    setComposeUrl(undefined);
  }
  function pickBatch(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setBatch(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
      setBatchIndex(0);
    }
  }
  function clearBatch() {
    batch.forEach((b) => URL.revokeObjectURL(b.url));
    setBatch([]);
    setBatchIndex(0);
  }
  function toggleNewMember(id: string) {
    setNewMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }
  function commitNewTag() {
    const name = newName.trim();
    if (!name) return;
    const key = createTag(name, newMembers);
    setSelected((s) => (s.includes(key) ? s : [...s, key]));
    setCreating(false);
    setNewName("");
    setNewMembers([]);
  }
  async function publish() {
    const fileToUpload = mode === "compose" ? composeFile : current?.file;
    if (!fileToUpload || uploading) return;
    setError(null);
    setUploading(true);
    let res;
    try {
      res = await uploadImage(fileToUpload, fileToUpload.type);
    } catch (e) {
      setUploading(false);
      setError(e instanceof Error ? e.message : "Image upload failed.");
      return;
    }
    setUploading(false);

    publishPost(
      mode === "compose"
        ? {
            kind: "composed",
            imageKey: res.key,
            imageUrl: res.url,
            imageHash: activeHash ?? undefined,
            compose: { bg: "#111111", watermark: "", top: compose.top, bottom: compose.bottom },
            tagKeys: selected,
          }
        : {
            kind: "image",
            imageKey: res.key,
            imageUrl: res.url,
            imageHash: activeHash ?? undefined,
            tagKeys: selected,
          },
    );

    // Upload queue: advance to the next image (keeping the chosen tags) instead
    // of leaving — only the last one in the batch sends you back to the feed.
    if (mode === "upload" && batchIndex + 1 < batch.length) {
      setBatchIndex(batchIndex + 1);
      return;
    }
    router.push("/feed");
  }

  return (
    <>
      <AdminTopBar title="New Post" />
      <main className="no-scrollbar flex-1 overflow-y-auto p-4">
        {/* compose vs upload */}
        <div className="flex gap-1 rounded-[11px] border border-line bg-input p-1">
          <Segment active={mode === "upload"} onClick={() => setMode("upload")}>
            Upload images
          </Segment>
          <Segment active={mode === "compose"} onClick={() => setMode("compose")}>
            Compose
          </Segment>
        </div>

        <div className="mt-4">
          {mode === "compose" ? (
            <MemeComposer
              imageUrl={composeUrl}
              top={compose.top}
              bottom={compose.bottom}
              onPick={pickComposeImage}
              onClear={clearComposeImage}
              onTopChange={(v) => setCompose({ ...compose, top: v })}
              onBottomChange={(v) => setCompose({ ...compose, bottom: v })}
            />
          ) : current ? (
            <div className="relative overflow-hidden rounded-[14px] border border-line bg-black">
              {current.file.type.startsWith("video/") ? (
                <video
                  src={current.url}
                  className="max-h-[320px] w-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.url} alt="upload preview" className="max-h-[320px] w-full object-contain" />
              )}
              <button
                type="button"
                onClick={clearBatch}
                className="absolute top-2.5 right-2.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
              >
                Clear
              </button>
              {batch.length > 1 ? (
                <div className="absolute bottom-2.5 left-2.5 rounded-full bg-black/50 px-2.5 py-[5px] font-mono text-[11px] text-ink-2 backdrop-blur">
                  {batchIndex + 1} of {batch.length}
                </div>
              ) : null}
            </div>
          ) : (
            <label className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-line-strong bg-input text-center">
              <PlusIcon size={22} strokeWidth={2} />
              <span className="text-sm font-semibold text-ink-2">Choose images or a video</span>
              <span className="text-xs text-muted-2">Videos up to 1 min · publish each with its own tags</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={pickBatch}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* tags */}
        <div className="mt-[18px]">
          <p className="text-[13px] font-semibold text-ink-2">Tags</p>
          <p className="mt-1 mb-[11px] text-xs text-muted-2">These decide which members get it.</p>
          <div className="flex flex-wrap gap-[9px]">
            {tags.map((t) => {
              const sel = selected.includes(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleTag(t.key)}
                  aria-pressed={sel}
                  className="flex h-[38px] items-center gap-[7px] rounded-[19px] border px-3.5 text-sm font-semibold"
                  style={{
                    background: sel ? "#3b82f6" : "#161616",
                    color: sel ? "#fff" : "#b4b4b4",
                    borderColor: sel ? "#3b82f6" : "#2a2a2a",
                  }}
                >
                  <span>{t.label}</span>
                  <span className="text-xs opacity-70">{sel ? "✓" : "+"}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCreating((c) => !c)}
              className="flex h-[38px] items-center gap-1.5 rounded-[19px] px-3.5 text-sm font-semibold"
              style={{ color: "#7eb0ff", border: "1.5px dashed rgba(59,130,246,.55)" }}
            >
              <PlusIcon size={15} strokeWidth={2.2} /> New tag
            </button>
          </div>

          {creating ? (
            <div className="mt-3 rounded-[14px] border border-line-strong bg-card-2 p-3.5">
              <p className="mb-[9px] text-[13px] font-semibold text-ink-2">Create a tag</p>
              <div className="flex items-center gap-2">
                <span className="text-lg text-muted-2">#</span>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="new tag name"
                  className="h-10 flex-1 rounded-[10px] border border-line-strong bg-input-2 px-3 text-sm text-ink outline-none placeholder:text-muted-2"
                />
              </div>
              <div className="mt-4 mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink-2">Assign to members</span>
                <span className="text-xs font-semibold" style={{ color: GREEN }}>
                  {newMembers.length === 0
                    ? "No members yet"
                    : newMembers.length === 1
                      ? "1 member assigned"
                      : `${newMembers.length} members assigned`}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {members.map((m) => {
                  const on = newMembers.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleNewMember(m.id)}
                      className="flex items-center gap-[11px] px-1 py-[7px] text-left"
                    >
                      <Avatar initials={m.initials} color={m.color} size={32} imageUrl={m.avatarUrl} />
                      <span className="flex-1 text-sm font-semibold text-[#e8e8e8]">{m.name}</span>
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-[7px] border-[1.5px] text-xs font-bold text-white"
                        style={{ background: on ? GREEN : "transparent", borderColor: on ? GREEN : "#3a3a3a" }}
                      >
                        {on ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3.5 flex gap-[9px]">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                    setNewMembers([]);
                  }}
                  className="h-[42px] rounded-[10px] border border-line-strong px-4 text-sm font-semibold text-ink-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={commitNewTag}
                  disabled={!newName.trim()}
                  className="h-[42px] flex-1 rounded-[10px] text-sm font-bold"
                  style={{
                    background: newName.trim() ? GREEN : "#1c2a1f",
                    color: newName.trim() ? "#04210f" : "#5a6b5e",
                  }}
                >
                  Create &amp; add to post
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* audience */}
        <div className="mt-[18px] rounded-[14px] border border-line bg-card p-[15px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-2">Audience</span>
            <span className="text-[13px] font-bold tabular-nums text-like">
              {matchedMembers.length} of {members.length} match
            </span>
          </div>
          <div className="mt-3 flex">
            {matchedMembers.slice(0, 5).map((m, i) => (
              <div
                key={m.id}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: m.color, boxShadow: "0 0 0 2px #111", marginLeft: i === 0 ? 0 : -6 }}
              >
                {m.initials}
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-muted">
            {audienceLine} will see posts tagged {tagLabels}.
          </p>
        </div>

        {dupWarning ? (
          <div className="mt-[18px] rounded-[10px] border border-draft/40 bg-draft/10 px-3 py-2 text-xs font-semibold text-draft">
            Heads up — this looks like one that’s already been posted. You can publish it anyway.
          </div>
        ) : null}

        {videoTooLong ? (
          <div className="mt-[18px] rounded-[10px] border border-dislike/40 bg-dislike/10 px-3 py-2 text-xs font-semibold text-dislike">
            Videos must be 1 minute or less — pick a shorter clip.
          </div>
        ) : null}

        {/* publish */}
        <div className="mt-[18px]">
          <button
            type="button"
            onClick={publish}
            disabled={!canPublish || uploading}
            className="h-12 w-full rounded-[12px] bg-like text-[15px] font-bold text-white disabled:opacity-50"
          >
            {uploading ? "Uploading…" : remaining > 0 ? `Publish & next (${remaining} left)` : "Send to space"}
          </button>
          {error ? <p className="mt-2 text-xs font-semibold text-dislike">{error}</p> : null}
        </div>
        <div className="h-2" />
      </main>
    </>
  );
}

function Segment({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 flex-1 rounded-[8px] text-[13px] font-semibold"
      style={{ background: active ? "#2a2a2a" : "transparent", color: active ? "#fafafa" : "#8a8a8a" }}
    >
      {children}
    </button>
  );
}
