"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

import { MAX_QUANTITY } from "@/lib/cart-store";

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Название позиции — для скринридеров. */
  label: string;
  /** На единице показывать корзину вместо минуса (в списке заказа). */
  trashAtOne?: boolean;
  /** md — крупный (карточки, h-11), sm — компактный (модалка, h-10). */
  size?: "md" | "sm";
  variant?: "default" | "artisan" | "boutique";
  className?: string;
}

const SIZES = {
  md: { root: "h-11 w-full", button: "w-12" },
  sm: { root: "h-9 w-[7.25rem]", button: "w-9" },
} as const;

/** Счётчик [- 1 +] с крупными зонами нажатия под палец. */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  label,
  trashAtOne = false,
  size = "md",
  variant = "default",
  className = "",
}: QuantityStepperProps) {
  const styles = SIZES[size];
  const showTrash = trashAtOne && value <= 1;
  const isBoutique = variant === "boutique" || variant === "artisan";
  const shell = isBoutique
    ? "border-[#EFEAE2] bg-[#FAF8F5] text-[#1A1A1A]"
    : "border-neutral-200 bg-neutral-50 text-neutral-900";
  const buttonBase = `grid ${styles.button} shrink-0 place-items-center transition-colors disabled:text-neutral-300 disabled:active:bg-transparent ${
    isBoutique
      ? "text-neutral-700 active:bg-neutral-200/60 hover:bg-neutral-200/40"
      : "text-neutral-700 active:bg-neutral-200 hover:bg-neutral-100"
  }`;

  return (
    <div
      role="group"
      aria-label={`Количество: ${label}`}
      className={`flex ${styles.root} items-stretch overflow-hidden rounded-full border select-none ${shell} ${className}`}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={showTrash ? `Удалить ${label}` : `Убавить ${label}`}
        className={`${buttonBase} active:scale-95`}
      >
        {showTrash ? (
          <Trash2 className="size-3.5" aria-hidden />
        ) : (
          <Minus className="size-3.5" strokeWidth={2} aria-hidden />
        )}
      </button>
      <span
        aria-live="polite"
        className="grid min-w-0 flex-1 place-items-center text-sm font-medium tabular-nums text-[#1A1A1A]"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={value >= MAX_QUANTITY}
        aria-label={`Добавить ${label}`}
        className={`${buttonBase} active:scale-95`}
      >
        <Plus className="size-3.5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
