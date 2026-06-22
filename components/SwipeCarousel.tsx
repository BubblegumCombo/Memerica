"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Horizontal snap carousel with drag-to-scroll, snap-on-release, click
 * suppression after a drag, and flag-striped prev/next arrows. Ports the
 * pointer logic from the design (Memerica.dc.html:841-869).
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
      <path
        d={arrow}
        fill="none"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SwipeCarousel({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  function tweenTo(p: number) {
    const c = scrollerRef.current;
    if (!c) return;
    const snap = c.style.scrollSnapType;
    c.style.scrollSnapType = "none";
    c.scrollLeft = p * c.clientWidth;
    void c.offsetWidth;
    c.style.scrollSnapType = snap;
  }

  useEffect(() => {
    const c = scrollerRef.current;
    if (!c) return;

    let drag: { x: number; sl: number; moved: boolean } | null = null;
    let suppressClick = false;

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, sl: c.scrollLeft, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      if (drag.moved) {
        c.scrollLeft = drag.sl - dx;
        if (e.cancelable) e.preventDefault();
      }
    };
    const onUp = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (moved) {
        suppressClick = true;
        const p = Math.max(0, Math.min(count - 1, Math.round(c.scrollLeft / Math.max(1, c.clientWidth))));
        const snap = c.style.scrollSnapType;
        c.style.scrollSnapType = "none";
        c.scrollLeft = p * c.clientWidth;
        void c.offsetWidth;
        c.style.scrollSnapType = snap;
      }
    };
    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false;
        e.stopPropagation();
        e.preventDefault();
      }
    };

    c.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    c.addEventListener("click", onClickCapture, true);
    return () => {
      c.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      c.removeEventListener("click", onClickCapture, true);
    };
  }, [count]);

  function onScroll() {
    const c = scrollerRef.current;
    if (!c) return;
    const p = Math.round(c.scrollLeft / Math.max(1, c.clientWidth));
    if (p !== page) setPage(p);
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="no-scrollbar flex flex-1 cursor-grab touch-pan-y select-none overflow-x-auto"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="flex w-full flex-none flex-col justify-center"
            style={{ scrollSnapAlign: "center" }}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-10 py-4">
        <button
          type="button"
          onClick={() => tweenTo(Math.max(0, page - 1))}
          className="transition-opacity disabled:opacity-25"
          disabled={page === 0}
          aria-label="Previous meme"
        >
          <FlagArrow dir="left" />
        </button>
        <button
          type="button"
          onClick={() => tweenTo(Math.min(count - 1, page + 1))}
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
