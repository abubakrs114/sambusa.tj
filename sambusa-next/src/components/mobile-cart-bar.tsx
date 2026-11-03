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
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 96, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 sm:hidden"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[#EFEAE2] bg-[#1A1A1A]/95 p-2 pl-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5">
                <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-[11px] font-light tracking-wide text-neutral-400 uppercase">
                  {totalCount} {pluralize(totalCount, ["товар", "товара", "товаров"])}
                </p>
                <motion.p
                  key={totalPrice}
                  initial={{ opacity: 0.4, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="truncate font-serif text-lg font-medium tabular-nums"
                >
                  {formatPrice(totalPrice)}
                </motion.p>
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
