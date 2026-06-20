import Link from "next/link";

/** Admin screen header: MEMERICA + Admin badge, a screen title, and the stripe. */
export function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="bg-bar px-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
      <div className="flex h-11 items-center">
        <div className="flex items-center gap-[9px]">
          <div className="flex h-[18px] overflow-hidden rounded-[3px]">
            <div className="w-1 bg-dislike" />
            <div className="w-1 bg-flag-white" />
            <div className="w-1 bg-like" />
          </div>
          <span className="text-[18px] font-extrabold tracking-[-0.4px]">MEMERICA</span>
          <span className="rounded-[5px] border border-draft/40 px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.08em] text-draft">
            Admin
          </span>
        </div>
        <Link
          href="/feed"
          className="ml-auto rounded-full border border-line-strong px-3 py-1.5 text-xs font-semibold text-muted"
        >
          Feed
        </Link>
      </div>
      <div className="pt-1.5 pb-3 text-2xl font-bold tracking-[-0.5px]">{title}</div>
      <div className="-mx-4 flex h-[3px]">
        <div className="flex-1 bg-flag-red" />
        <div className="flex-1 bg-[#e9e9ea]" />
        <div className="flex-1 bg-flag-navy" />
      </div>
    </header>
  );
}
