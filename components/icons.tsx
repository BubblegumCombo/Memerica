import type { SVGProps } from "react";

// Line-icon set ported from the design source (Memerica.dc.html). Stroke uses
// currentColor; thumbs accept a `fill` so a cast vote can fill the glyph.

export type IconProps = {
  size?: number;
  fill?: string;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "fill">;

function base(size: number, strokeWidth: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth,
    "aria-hidden": true,
  };
}

export function ThumbUp({ size = 21, fill = "none", strokeWidth = 1.9, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

export function ThumbDown({ size = 21, fill = "none", strokeWidth = 1.9, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

export function CommentIcon({ size = 21, fill = "none", strokeWidth = 1.9, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export function HomeIcon({ size = 23, fill = "none", strokeWidth = 1.9, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function UserIcon({ size = 23, fill = "none", strokeWidth = 1.9, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ChevronLeft({ size = 22, fill = "none", strokeWidth = 2.2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRight({ size = 22, fill = "none", strokeWidth = 2.2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function SendIcon({ size = 19, fill = "none", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}

export function PlusIcon({ size = 16, fill = "none", strokeWidth = 2.2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

export function CheckIcon({ size = 16, fill = "none", strokeWidth = 2.4, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} fill={fill} {...rest}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
