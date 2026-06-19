import { BrandMark } from "./BrandMark";

/** Shared member top bar: MEMERICA wordmark + the red/white/blue stripe. */
export function MemberTopBar() {
  return (
    <header
      className="bg-bar px-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
    >
      <div className="flex h-[46px] items-center">
        <BrandMark />
      </div>
      <div className="-mx-4 mt-[6px] flex h-[3px]">
        <div className="flex-1 bg-flag-red" />
        <div className="flex-1 bg-[#e9e9ea]" />
        <div className="flex-1 bg-flag-navy" />
      </div>
    </header>
  );
}
