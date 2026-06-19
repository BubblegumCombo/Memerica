/**
 * Memerica brand mark — the stars & stripes emblem + "MEMERICA ★" wordmark.
 * Ported from the design top bar (Memerica.dc.html:96-101).
 */

export function StarIcon({
  size = 13,
  fill = "currentColor",
  className,
}: {
  size?: number;
  fill?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      className={className}
      aria-hidden
    >
      <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 6 21.2l1.4-6.8L2.3 9.7l6.9-.7z" />
    </svg>
  );
}

export function FlagEmblem({
  height = 22,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const navyW = Math.round((24 / 22) * height);
  const stripeW = Math.round((26 / 22) * height);
  const star = Math.round((13 / 22) * height);

  return (
    <div
      className={`flex items-center overflow-hidden rounded-[4px] ${className}`}
      style={{ height, boxShadow: "0 0 0 1px rgba(255,255,255,.14)" }}
      aria-hidden
    >
      <div
        className="flex items-center justify-center bg-flag-navy"
        style={{ width: navyW, height }}
      >
        <StarIcon size={star} fill="#fff" />
      </div>
      <div className="flex flex-col" style={{ width: stripeW, height }}>
        <div className="flex-1 bg-flag-red" />
        <div className="flex-1 bg-flag-white" />
        <div className="flex-1 bg-flag-red" />
        <div className="flex-1 bg-flag-white" />
      </div>
    </div>
  );
}

export function BrandMark({
  emblemHeight = 22,
  word = 20,
  className = "",
}: {
  emblemHeight?: number;
  word?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-[10px] ${className}`}>
      <FlagEmblem height={emblemHeight} />
      <span
        className="font-extrabold tracking-[-0.5px] text-ink"
        style={{ fontSize: word }}
      >
        MEMERICA
      </span>
      <span
        className="-ml-[3px] leading-none text-flag-red"
        style={{ fontSize: Math.round(word * 0.8) }}
        aria-hidden
      >
        ★
      </span>
    </div>
  );
}
