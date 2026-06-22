export function Avatar({
  initials,
  color,
  size = 34,
  fontSize,
  imageUrl,
}: {
  initials: string;
  color: string;
  size?: number;
  fontSize?: number;
  imageUrl?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={initials}
        className="flex-none rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex flex-none items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: fontSize ?? Math.round(size * 0.36) }}
    >
      {initials}
    </div>
  );
}
