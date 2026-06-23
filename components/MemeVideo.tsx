"use client";

import { useState } from "react";

/** Autoplaying, muted, looping feed video. Tap to toggle sound. */
export function MemeVideo({ src, className }: { src: string; className?: string }) {
  const [muted, setMuted] = useState(true);
  return (
    <div className="relative h-full w-full">
      <video
        src={src}
        autoPlay
        loop
        muted={muted}
        playsInline
        onClick={() => setMuted((m) => !m)}
        className={className}
      />
      <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        {muted ? "Tap for sound" : "Sound on"}
      </span>
    </div>
  );
}
