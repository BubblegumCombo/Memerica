"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/**
 * Horizontal carousel that animates between posts: the track translates with a
 * CSS transition (the old post slides off, the new one slides in). Supports
 * touch and mouse swipe — a drag follows the finger/cursor and snaps to the
 * nearest post on release. Flag-striped prev/next arrows animate the same way.
 */

/** Left/right nav arrow filled with red/white/blue US-flag stripes. */
function FlagArrow({ dir }: { dir: "left" | "right" }) {
  const clip = `flag-arrow-${dir}`;
  const arrow = "M3 9 H13 V5 L21 12 L13 19 V15 H3 Z";
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ transform: dir === "left" ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <clipPath id={clip}>
          <path d={arrow} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="24" height="8" fill="#b22234" />
        <rect x="0" y="8" width="24" height="8" fill="#f5f5f5" />
        <rect x="0" y="16" width="24" height="8" fill="#3c3b6e" />
      </g>
      <path d={arrow} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

const EASE = "transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)";

export function SwipeCarousel({
  children,
  initialPage = 0,
  onPageChange,
}: {
  children: ReactNode;
  /** Page to restore on mount (resume where the user left off). */
  initialPage?: number;
  /** Called with the current page index as the user navigates. */
  onPageChange?: (page: number) => void;
}) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [page, setPage] = useState(initialPage);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; w: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const first = useRef(true);

  const place = useCallback((px: number, animate: boolean) => {
    const t = trackRef.current;
    if (!t) return;
    t.style.transition = animate ? EASE : "none";
    t.style.transform = `translate3d(${px}px, 0, 0)`;
  }, []);

  // Rest at the current page — jump on first paint (incl. resumed position),
  // animate on every change after that.
  useEffect(() => {
    const w = viewportRef.current?.clientWidth ?? 0;
    place(-page * w, !first.current);
    first.current = false;
  }, [page, place]);

  // Keep the offset correct across viewport resizes (no animation).
  useEffect(() => {
    const onResize = () => {
      const w = viewportRef.current?.clientWidth ?? 0;
      place(-page * w, false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [page, place]);

  function go(next: number) {
    const clamped = Math.max(0, Math.min(count - 1, next));
    if (clamped === page) return;
    setPage(clamped);
    onPageChange?.(clamped);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const w = viewportRef.current?.clientWidth ?? 0;
    drag.current = { startX: e.clientX, w, moved: false };
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      // Only capture once it's clearly a drag, so taps still reach buttons/links.
      viewportRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    let off = dx;
    if ((page === 0 && off > 0) || (page === count - 1 && off < 0)) off *= 0.35; // edge resistance
    place(-page * d.w + off, false);
  }
  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (!d.moved) return;
    suppressClick.current = true;
    const dx = e.clientX - d.startX;
    const threshold = Math.min(80, d.w * 0.2);
    if (dx <= -threshold && page < count - 1) go(page + 1);
    else if (dx >= threshold && page > 0) go(page - 1);
    else place(-page * d.w, true); // not far enough — snap back
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={viewportRef}
        className="relative flex-1 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <div ref={trackRef} className="flex h-full" style={{ willChange: "transform" }}>
          {slides.map((slide, i) => (
            <div
              key={isValidElement(slide) && slide.key != null ? slide.key : i}
              className="h-full w-full flex-none"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-10 py-4">
        <button
          type="button"
          onClick={() => go(page - 1)}
          className="transition-opacity disabled:opacity-25"
          disabled={page === 0}
          aria-label="Previous meme"
        >
          <FlagArrow dir="left" />
        </button>
        <button
          type="button"
          onClick={() => go(page + 1)}
          className="transition-opacity disabled:opacity-25"
          disabled={page === count - 1}
          aria-label="Next meme"
        >
          <FlagArrow dir="right" />
        </button>
      </div>
    </div>
  );
}
