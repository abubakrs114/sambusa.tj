"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useCartUi } from "@/context/cart-ui";

/** Краткое уведомление после отправки заказа в WhatsApp. */
export function OrderSentToast() {
  const { orderSentVisible, dismissOrderSent } = useCartUi();

  return (
    <AnimatePresence>
      {orderSentVisible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          role="status"
          className="fixed top-[calc(var(--header-h)+0.75rem)] right-4 left-4 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-[#EFEAE2] bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.08)] sm:left-auto"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1A1A1A] text-white">
            <Check className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-serif text-sm font-medium text-[#1A1A1A]">
              Предзаказ отправлен в WhatsApp
            </p>
            <p className="mt-0.5 text-xs leading-relaxed font-light text-neutral-500">
              Нажмите «Отправить» в чате — мы соберём заказ к вашему приезду.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissOrderSent}
            className="shrink-0 text-xs font-medium tracking-wide text-neutral-500 uppercase hover:text-[#1A1A1A]"
          >
            OK
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
