import {
  Cake,
  ChefHat,
  Cookie,
  Croissant,
  PieChart,
  Wheat,
  type LucideIcon,
} from "lucide-react";

import type { ProductPlaceholderKind } from "@/types";

interface PlaceholderStyle {
  icon: LucideIcon;
  label: string;
  accent: string;
}

const STYLES: Record<ProductPlaceholderKind, PlaceholderStyle> = {
  sambusa: { icon: ChefHat, label: "Тандыр", accent: "#E8DFD3" },
  bun: { icon: Croissant, label: "Выпечка", accent: "#E5DDD2" },
  pie: { icon: PieChart, label: "Пирог", accent: "#E3DACE" },
  bread: { icon: Wheat, label: "Хлеб", accent: "#E0D9CC" },
  cake: { icon: Cake, label: "Торт", accent: "#E6DCE4" },
  sweet: { icon: Cookie, label: "Сладости", accent: "#E8E0D4" },
};

function BakeryOrnament({ accent }: { accent: string }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full opacity-[0.45]"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="320" cy="80" r="120" fill={accent} fillOpacity="0.35" />
      <circle cx="60" cy="340" r="100" fill={accent} fillOpacity="0.28" />
      <circle cx="200" cy="200" r="160" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.35" />
      <path
        d="M40 200 Q200 120 360 200"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

interface ProductPlaceholderProps {
  kind: ProductPlaceholderKind;
  alt: string;
  variant?: "card" | "thumb";
}

/** Тёплая premium-плашка для позиций без локального фото. */
export function ProductPlaceholder({
  kind,
  alt,
  variant = "card",
}: ProductPlaceholderProps) {
  const style = STYLES[kind];
  const Icon = style.icon;
  const isCard = variant === "card";

  return (
    <div
      role="img"
      aria-label={alt}
      className="absolute inset-0 overflow-hidden bg-[#F7F4EE]"
    >
      <BakeryOrnament accent={style.accent} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F5]/30 via-transparent to-[#EFEAE2]/50" />

      {isCard && (
        <span className="absolute top-3 left-3 z-10 rounded-full border border-[#EFEAE2]/90 bg-white/85 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] text-neutral-600 uppercase backdrop-blur-sm">
          {style.label}
        </span>
      )}

      <div className="relative z-[1] grid size-full place-items-center">
        <div className="grid size-[4.5rem] place-items-center rounded-full border border-[#EFEAE2]/80 bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-[2px]">
          <Icon
            className={`text-[#9C8B7A] ${isCard ? "size-9" : "size-4"}`}
            strokeWidth={1.1}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
