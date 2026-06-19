"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "./icons";

/**
 * Horizontal snap carousel with drag-to-scroll, snap-on-release, click
 * suppression after a drag, and a star dot row + prev/next nav. Ports the
 * pointer logic from the design (Memerica.dc.html:841-869).
 */
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

      <div className="flex items-center justify-center gap-[10px] py-4">
        <button
          type="button"
          onClick={() => tweenTo(Math.max(0, page - 1))}
          className="p-1.5 text-muted disabled:opacity-40"
          disabled={page === 0}
          aria-label="Previous meme"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tweenTo(i)}
            className="p-[5px] leading-[0]"
            aria-label={`Go to meme ${i + 1}`}
            aria-current={i === page ? "true" : undefined}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={i === page ? "#ffffff" : "rgba(255,255,255,0.28)"} aria-hidden>
              <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 6 21.2l1.4-6.8L2.3 9.7l6.9-.7z" />
            </svg>
          </button>
        ))}
        <button
          type="button"
          onClick={() => tweenTo(Math.min(count - 1, page + 1))}
          className="p-1.5 text-muted disabled:opacity-40"
          disabled={page === count - 1}
          aria-label="Next meme"
        >
          <ChevronRight size={20} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
