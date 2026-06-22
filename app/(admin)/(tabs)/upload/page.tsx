"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { MemeCompose } from "@/lib/types";
import { useStore } from "@/lib/data/store";
import { AdminTopBar } from "@/components/AdminTopBar";
import { MemeComposer } from "@/components/MemeComposer";
import { Avatar } from "@/components/Avatar";
import { PlusIcon, CheckIcon } from "@/components/icons";
import { uploadImage } from "@/lib/upload";

const DEFAULT_COMPOSE: MemeCompose = {
  bg: "#243a2a",
  watermark: "BASED",
  top: "Took the trash out",
  bottom: "Felt unreasonably based",
};

const GREEN = "#22c55e";

export default function UploadPage() {
  const { tags, members, createTag, publishPost } = useStore();
  const router = useRouter();

  const [mode, setMode] = useState<"compose" | "upload">("upload");
  const [compose, setCompose] = useState<MemeCompose>(DEFAULT_COMPOSE);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const [selected, setSelected] = useState<string[]>(["based", "gaming"]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [flash, setFlash] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMembers, setNewMembers] = useState<string[]>([]);

  const matchedMembers = members.filter((m) => m.tagKeys.some((t) => selected.includes(t)));
  const audienceLine =
    matchedMembers.map((m) => m.name).concat(["you"]).slice(0, 4).join(", ") +
    (matchedMembers.length > 3 ? " …" : "");
  const tagLabels = selected.map((k) => "#" + k).join(" ") || "no tags yet";
  const canPublish = mode === "compose" ? Boolean(compose.top || compose.bottom) : Boolean(file);

  function toggleTag(k: string) {
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }
  function pickImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setImageUrl(URL.createObjectURL(f));
    }
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
    if (!canPublish || uploading) return;
    setError(null);

    let imageKey: string | undefined;
    let uploadedUrl: string | undefined;
    if (mode === "upload") {
      if (!file) return;
      setUploading(true);
      try {
        const res = await uploadImage(file, file.type);
        imageKey = res.key;
        uploadedUrl = res.url;
      } catch (e) {
        setUploading(false);
        setError(e instanceof Error ? e.message : "Image upload failed.");
        return;
      }
      setUploading(false);
    }

    publishPost({
      kind: mode === "upload" ? "image" : "composed",
      imageKey,
      imageUrl: mode === "upload" ? uploadedUrl : undefined,
      compose: mode === "compose" ? compose : undefined,
      caption,
      tagKeys: selected,
      status,
    });
    if (status === "published") {
      router.push("/feed");
    } else {
      setFlash("Saved as draft — only you can see it");
    }
  }

  return (
    <>
      <AdminTopBar title="New Post" />
      <main className="no-scrollbar flex-1 overflow-y-auto p-4">
        {flash ? (
          <div className="mb-3 rounded-[10px] border border-success/40 bg-success/10 px-3 py-2 text-xs font-semibold text-success">
            {flash}
          </div>
        ) : null}

        {/* compose vs upload */}
        <div className="flex gap-1 rounded-[11px] border border-line bg-input p-1">
          <Segment active={mode === "upload"} onClick={() => setMode("upload")}>
            Upload image
          </Segment>
          <Segment active={mode === "compose"} onClick={() => setMode("compose")}>
            Compose
          </Segment>
        </div>

        <div className="mt-4">
          {mode === "compose" ? (
            <MemeComposer value={compose} onChange={setCompose} />
          ) : (
            <ImagePicker
              imageUrl={imageUrl}
              onPick={pickImage}
              onClear={() => {
                setImageUrl(undefined);
                setFile(null);
              }}
            />
          )}
        </div>

        {/* caption */}
        <div className="mt-[18px]">
          <p className="mb-[7px] text-[13px] font-semibold text-ink-2">Caption</p>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Optional — add a line"
            className="h-[42px] w-full rounded-[10px] border border-line-strong bg-input px-3.5 text-sm text-ink outline-none placeholder:text-muted-2"
          />
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

        {/* publish */}
        <div className="mt-[18px]">
          <div className="flex gap-1 rounded-[11px] border border-line bg-input p-1">
            <Segment active={status === "draft"} onClick={() => setStatus("draft")}>
              Draft
            </Segment>
            <Segment
              active={status === "published"}
              onClick={() => setStatus("published")}
              activeBg="rgba(34,197,94,.18)"
            >
              Published
            </Segment>
          </div>
          <p
            className="mt-2.5 text-xs font-semibold"
            style={{ color: status === "published" ? GREEN : "#eab308" }}
          >
            {status === "published" ? "Published · live to space" : "Draft · only you can see this"}
          </p>
          <button
            type="button"
            onClick={publish}
            disabled={!canPublish || uploading}
            className="mt-3.5 h-12 w-full rounded-[12px] bg-like text-[15px] font-bold text-white disabled:opacity-50"
          >
            {uploading ? "Uploading…" : status === "published" ? "Send to space" : "Save draft"}
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
  activeBg = "#2a2a2a",
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  activeBg?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 flex-1 rounded-[8px] text-[13px] font-semibold"
      style={{ background: active ? activeBg : "transparent", color: active ? "#fafafa" : "#8a8a8a" }}
    >
      {children}
    </button>
  );
}

function ImagePicker({
  imageUrl,
  onPick,
  onClear,
}: {
  imageUrl?: string;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  if (imageUrl) {
    return (
      <div className="relative overflow-hidden rounded-[14px] border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="meme upload preview" className="max-h-[320px] w-full object-cover" />
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2.5 right-2.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
        >
          Replace
        </button>
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-[5px] backdrop-blur">
          <CheckIcon size={13} strokeWidth={2.4} style={{ color: GREEN }} />
          <span className="font-mono text-[11px] text-ink-2">staged for upload</span>
        </div>
      </div>
    );
  }
  return (
    <label className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-line-strong bg-input text-center">
      <PlusIcon size={22} strokeWidth={2} />
      <span className="text-sm font-semibold text-ink-2">Choose an image</span>
      <span className="text-xs text-muted-2">PNG or JPG — uploaded to S3 in Phase 4</span>
      <input type="file" accept="image/*" onChange={onPick} className="hidden" />
    </label>
  );
}
