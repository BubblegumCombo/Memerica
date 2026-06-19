import { AppShell } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";

export default function Home() {
  return (
    <AppShell>
      {/* top bar */}
      <header className="bg-bar px-4 pt-[50px] pb-3 pt-safe">
        <BrandMark />
        <div className="-mx-4 mt-[6px] flex h-[3px]">
          <div className="flex-1 bg-flag-red" />
          <div className="flex-1 bg-[#e9e9ea]" />
          <div className="flex-1 bg-flag-navy" />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-5 py-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-flag-red">
            Freedom of the Feed
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight">
            Welcome to <br /> MEMERICA <span className="text-flag-red">★</span>
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            A tagged meme-sharing space. The admin curates the feed; you swipe,
            react, and run the thread. This is the shell — screens land next.
          </p>
        </div>

        {/* sample meme card — verifies Anton, the outline caption, and tokens */}
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_14px_44px_rgba(0,0,0,.45)]">
          <div
            className="relative flex h-[300px] flex-col justify-between p-5"
            style={{ background: "#1e3a5f" }}
          >
            <div
              className="meme-wm pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ fontSize: 120 }}
            >
              CATS
            </div>
            <div className="meme-cap relative text-center" style={{ fontSize: 26 }}>
              When the red dot
            </div>
            <div className="meme-cap relative text-center" style={{ fontSize: 26 }}>
              finally holds still
            </div>
          </div>
          <div className="flex items-center gap-2 p-3">
            <span className="inline-flex h-10 items-center rounded-[20px] px-3.5 text-sm font-semibold text-like">
              ▲ 842
            </span>
            <span className="inline-flex h-10 items-center rounded-[20px] px-3.5 text-sm font-semibold text-dislike">
              ▼ 17
            </span>
            <span className="flex-1" />
            <span className="inline-flex h-10 items-center rounded-[20px] px-3.5 text-sm font-semibold text-muted">
              24 comments
            </span>
          </div>
        </div>

        <p className="font-mono text-xs text-faint">
          Phase 0 · shell, fonts &amp; design tokens ready
        </p>
      </main>
    </AppShell>
  );
}
