export function Avatar({
  initials,
  color,
  size = 34,
  fontSize,
}: {
  initials: string;
  color: string;
  size?: number;
  fontSize?: number;
}) {
  return (
    <div
      className="flex flex-none items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: fontSize ?? Math.round(size * 0.36) }}
    >
      {initials}
    </div>
  );
}
