"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Feed video: plays only while it's the on-screen slide, muted by default, and
 * loops. Tap toggles sound. Muting and play/pause are driven imperatively on the
 * element (the React `muted` attribute doesn't reliably gate autoplay), and an
 * IntersectionObserver pauses + re-mutes the video once it scrolls off-screen so
 * you never get several clips (or stray audio) playing at once.
 */
export function MemeVideo({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const onscreen = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        setActive(onscreen);
        if (!onscreen) setMuted(true); // never leave audio playing off-screen
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active, muted]);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={src}
        loop
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
