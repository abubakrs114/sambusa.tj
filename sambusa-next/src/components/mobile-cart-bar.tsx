"use client";

import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useCartUi } from "@/context/cart-ui";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, pluralize } from "@/lib/format";

/** Плавающая нижняя плашка корзины — только на мобильных. */
export function MobileCartBar() {
  const { open, isOpen } = useCartUi();
  const { totalCount, totalPrice } = useCart();
  const visible = totalCount > 0 && !isOpen;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="mobile-cart-bar"
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-4 bottom-4 z-50 sm:hidden"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-[#1A1A1A] p-2 pl-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5">
                <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-[11px] font-light tracking-wide text-neutral-400 uppercase">
                  {totalCount} {pluralize(totalCount, ["товар", "товара", "товаров"])}
                </p>
                <p className="truncate font-serif text-lg font-medium tabular-nums">
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={open}
              className="h-11 shrink-0 rounded-full bg-[#FAF8F5] px-5 text-[11px] font-medium tracking-wider text-[#1A1A1A] uppercase transition-colors active:scale-95"
            >
              Оформить
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
