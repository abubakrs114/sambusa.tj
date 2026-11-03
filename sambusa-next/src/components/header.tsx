"use client";

import { Phone, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useSyncExternalStore } from "react";

import { useStorefront } from "@/context/store-context";
import { useCartUi } from "@/context/cart-ui";
import { useCart } from "@/hooks/use-cart";
import { cartStore } from "@/lib/cart-store";
import { formatPrice, pluralize } from "@/lib/format";
import {
  getTandyrStatusHeaderLine,
} from "@/lib/tandyr-status";
import type { TandyrStatus } from "@/types/store";

function statusDotClass(status: TandyrStatus): string {
  if (status === "hot") return "bg-emerald-500 animate-pulse";
  if (status === "baking") return "bg-amber-500 animate-pulse";
  return "bg-neutral-400";
}

function TandyrStatusLine({ className = "" }: { className?: string }) {
  const { settings } = useStorefront();
  const status = settings.tandyrStatus;
  const label = getTandyrStatusHeaderLine(status);
  const showPulseDot = !label.startsWith("\uD83D\uDFE2");

  return (
    <span
      className={`flex items-center gap-1.5 text-[11px] font-light text-neutral-500 ${className}`}
    >
      {showPulseDot && (
        <span
          className={`size-1.5 shrink-0 rounded-full ${statusDotClass(status)}`}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

function CartControl({ compact }: { compact?: boolean }) {
  const { open } = useCartUi();
  const { totalCount, totalPrice } = useCart();
  const cartPulse = useSyncExternalStore(
    cartStore.subscribe,
    () => cartStore.getCartPulse(),
    () => 0,
  );

  const badge =
    totalCount > 0 ? (
      <motion.span
        key={totalCount}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 14 }}
        className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#1A1A1A] px-1 text-[11px] leading-none font-semibold text-white ring-2 ring-[#FAF8F5] tabular-nums"
      >
        {totalCount}
      </motion.span>
    ) : null;

  if (compact) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={`Открыть корзину, ${totalCount} ${pluralize(totalCount, ["товар", "товара", "товаров"])}`}
        className="relative grid size-9 place-items-center rounded-full bg-neutral-100 text-[#1A1A1A] transition-colors hover:bg-neutral-200 active:scale-95 sm:hidden"
      >
        <motion.span
          key={cartPulse}
          animate={cartPulse > 0 ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-flex"
        >
          <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />
        </motion.span>
        {badge}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Открыть корзину, ${totalCount} ${pluralize(totalCount, ["товар", "товара", "товаров"])}`}
      className="relative hidden h-11 items-center gap-2 rounded-full border border-[#1A1A1A] bg-[#1A1A1A] pr-4 pl-3.5 text-xs font-medium tracking-wider text-white uppercase transition-all hover:bg-neutral-800 active:scale-95 sm:inline-flex sm:pr-5"
    >
      <motion.span
        key={cartPulse}
        animate={cartPulse > 0 ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="inline-flex"
      >
        <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />
      </motion.span>
      <span>{totalCount > 0 ? formatPrice(totalPrice) : "Корзина"}</span>
      {totalCount > 0 && (
        <motion.span
          key={totalCount}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 14 }}
          className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] leading-none font-semibold text-[#1A1A1A] ring-2 ring-[#FAF8F5] tabular-nums"
        >
          {totalCount}
        </motion.span>
      )}
    </button>
  );
}

export function Header() {
  const { settings } = useStorefront();
  const phoneHref = `tel:+${settings.whatsappPhoneE164}`;

  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-[#D8CEBF] bg-[#FAF8F5] backdrop-blur-md supports-[backdrop-filter]:bg-[#FAF8F5]/95">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-0 lg:px-8">
        <div className="grid w-full flex-1 grid-cols-[1fr_auto_1fr] items-center gap-1 sm:grid-cols-3 sm:gap-0 sm:py-4">
          <div className="col-start-1 flex min-w-0 flex-col items-start gap-0.5 justify-self-start">
            <a
              href={phoneHref}
              className="hidden items-center gap-2 text-xs font-medium text-neutral-800 transition-colors hover:text-black sm:flex md:text-sm"
            >
              <Phone className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="whitespace-nowrap tabular-nums">{settings.phoneDisplay}</span>
            </a>
            <a
              href={phoneHref}
              aria-label={`Позвонить ${settings.phoneDisplay}`}
              className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200 hover:text-black active:scale-95 sm:hidden"
            >
              <Phone className="size-4" strokeWidth={1.75} aria-hidden />
            </a>
            <TandyrStatusLine className="hidden max-w-[10rem] leading-snug sm:flex md:max-w-none" />
          </div>

          <a
            href="#top"
            aria-label="Sambusa.tj — на главную"
            className="site-logo col-start-2 block min-w-0 shrink-0 justify-self-center text-center whitespace-nowrap"
          >
            Sambusa.tj
          </a>

          <div className="col-start-3 flex justify-end justify-self-end">
            <CartControl compact />
            <CartControl />
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-[#EAE5DE]/40 py-1.5 sm:hidden">
          <TandyrStatusLine className="text-[11px] text-neutral-500" />
        </div>
      </div>
    </header>
  );
}
