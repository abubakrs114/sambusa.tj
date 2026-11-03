import { Cherry, Coffee, Milk, type LucideIcon } from "lucide-react";

import type { DrinkInfo, DrinkKind } from "@/types";

interface DrinkStyle {
  icon: LucideIcon;
  background: string;
  iconColor: string;
  badge: string;
}

const STYLES: Record<DrinkKind, DrinkStyle> = {
  tea: {
    icon: Coffee,
    background: "bg-[#F5F0E8]",
    iconColor: "text-neutral-400",
    badge: "border border-[#EFEAE2] bg-white/80 text-neutral-600",
  },
  ayran: {
    icon: Milk,
    background: "bg-[#F7F6F3]",
    iconColor: "text-neutral-400",
    badge: "border border-[#EFEAE2] bg-white/80 text-neutral-600",
  },
  compote: {
    icon: Cherry,
    background: "bg-[#F3EFEB]",
    iconColor: "text-neutral-400",
    badge: "border border-[#EFEAE2] bg-white/80 text-neutral-600",
  },
};

interface DrinkVisualProps {
  drink: DrinkInfo;
  alt: string;
  variant?: "card" | "thumb";
}

/** Монохромная плашка напитка: пастель, тонкая иконка, объём. */
export function DrinkVisual({ drink, alt, variant = "card" }: DrinkVisualProps) {
  const style = STYLES[drink.kind];
  const Icon = style.icon;
  const isCard = variant === "card";

  return (
    <div
      role="img"
      aria-label={`${alt}, ${drink.volume}`}
      className={`absolute inset-0 grid place-items-center overflow-hidden ${style.background}`}
    >
      {isCard && (
        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${style.badge}`}
        >
          {drink.volume}
        </span>
      )}
      <Icon
        className={`${style.iconColor} ${isCard ? "size-9 opacity-70" : "size-4"}`}
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  );
}
