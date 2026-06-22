"use client";

import type { ChangeEvent } from "react";
import { MemeMedia } from "./MemeMedia";
import { PlusIcon } from "./icons";

/**
 * Compose a meme from an uploaded image plus top and bottom captions. The
 * preview overlays the captions live; on publish the image goes to S3 and the
 * captions are stored alongside it.
 */
export function MemeComposer({
  imageUrl,
  top,
  bottom,
  onPick,
  onClear,
  onTopChange,
  onBottomChange,
}: {
  imageUrl?: string;
  top: string;
  bottom: string;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onTopChange: (v: string) => void;
  onBottomChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {imageUrl ? (
        <div className="relative overflow-hidden rounded-[14px] border border-line">
          <MemeMedia
            post={{
              id: "preview",
              kind: "composed",
              imageUrl,
              compose: { bg: "#111111", watermark: "", top, bottom },
              tagKeys: [],
              status: "published",
              likeCount: 0,
              dislikeCount: 0,
              createdAt: "",
            }}
            height={300}
            captionSize={26}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2.5 right-2.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
          >
            Replace
          </button>
        </div>
      ) : (
        <label className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-line-strong bg-input text-center">
          <PlusIcon size={22} strokeWidth={2} />
          <span className="text-sm font-semibold text-ink-2">Choose an image</span>
          <span className="text-xs text-muted-2">Add top &amp; bottom captions below</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPick} className="hidden" />
        </label>
      )}
      <Field label="Top caption" value={top} onChange={onTopChange} placeholder="Top text" />
      <Field label="Bottom caption" value={bottom} onChange={onBottomChange} placeholder="Bottom text" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-[10px] border border-line-strong bg-input px-3.5 text-sm text-ink outline-none placeholder:text-muted-2"
      />
    </label>
  );
}
