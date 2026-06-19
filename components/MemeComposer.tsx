"use client";

import type { MemeCompose } from "@/lib/types";
import { MemeMedia } from "./MemeMedia";

const BG_SWATCHES = [
  "#1e3a5f", "#3a1f24", "#243a2a", "#3c3b6e", "#b22234", "#0d0d0d", "#2a2118", "#1f2937",
];

/** Controlled in-app meme composer: colored background + watermark + two lines. */
export function MemeComposer({
  value,
  onChange,
}: {
  value: MemeCompose;
  onChange: (next: MemeCompose) => void;
}) {
  const set = (patch: Partial<MemeCompose>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-3.5">
      <div className="overflow-hidden rounded-[14px] border border-line">
        <MemeMedia
          post={{
            id: "preview",
            kind: "composed",
            compose: value,
            tagKeys: [],
            status: "draft",
            likeCount: 0,
            dislikeCount: 0,
            createdAt: "",
          }}
          height={220}
          captionSize={24}
          watermarkSize={110}
        />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-ink-2">Background</p>
        <div className="flex flex-wrap gap-2">
          {BG_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ bg: c })}
              aria-label={`Background ${c}`}
              aria-pressed={value.bg === c}
              className="h-8 w-8 rounded-full border-2"
              style={{ background: c, borderColor: value.bg === c ? "#fafafa" : "rgba(255,255,255,0.12)" }}
            />
          ))}
        </div>
      </div>

      <Field
        label="Watermark word"
        value={value.watermark}
        onChange={(v) => set({ watermark: v.toUpperCase() })}
        placeholder="e.g. CATS"
      />
      <Field label="Top line" value={value.top} onChange={(v) => set({ top: v })} placeholder="Top caption" />
      <Field label="Bottom line" value={value.bottom} onChange={(v) => set({ bottom: v })} placeholder="Bottom caption" />
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
