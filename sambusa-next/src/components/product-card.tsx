"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";

import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductCardMedia } from "@/components/ui/product-card-media";
import { useProductQuantity } from "@/hooks/use-cart";
import { cartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { ProductBadge } from "@/types";
import type { StorefrontProduct } from "@/types/store";

const BADGES: Record<ProductBadge, { label: string; className: string }> = {
  hit: {
    label: "Хит",
    className:
      "border border-white/70 bg-white/85 text-[11px] font-medium tracking-wide text-neutral-800 uppercase backdrop-blur-md",
  },
  new: {
    label: "Новинка",
    className:
      "border border-white/70 bg-white/85 text-[11px] font-medium tracking-wide text-neutral-800 uppercase backdrop-blur-md",
  },
  set: {
    label: "Сет",
    className:
      "border border-white/70 bg-white/85 text-[11px] font-medium tracking-wide text-neutral-800 uppercase backdrop-blur-md",
  },
};

interface ProductCardProps {
  product: StorefrontProduct;
  index: number;
  animateIn: boolean;
  priority?: boolean;
}

const swap = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
  transition: { duration: 0.14 },
} as const;

function ProductCardBase({ product, index, animateIn, priority }: ProductCardProps) {
  const quantity = useProductQuantity(product.id);
  const badge = product.badge ? BADGES[product.badge] : null;
  const soldOut = !product.inStock;
  const discountBadge = product.originalPrice
    ? product.discountPercent
      ? `−${Math.round(product.discountPercent)}%`
      : "Акция"
    : null;

  return (
    <motion.article
      initial={animateIn ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.2) }}
      className={`group flex h-full flex-col rounded-2xl border bg-white transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] ${
        quantity > 0
          ? "border-neutral-300 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          : "border-[#F0EBE1] shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
      } ${soldOut ? "opacity-95" : ""}`}
    >
      <div
        className={`relative aspect-square overflow-hidden rounded-t-2xl bg-neutral-50 ${
          product.drink ? "max-h-36" : ""
        }`}
      >
        <ProductCardMedia
          product={product}
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          soldOut={soldOut}
        />
        {badge && (
          <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 ${badge.className}`}>
            {badge.label}
          </span>
        )}
        {discountBadge && (
          <span className="absolute top-3 right-3 rounded-full bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-medium tracking-wide text-white uppercase">
            {discountBadge}
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-white/55 backdrop-blur-[2px]">
            <span className="rounded-full border border-[#EFEAE2] bg-white px-3 py-1 text-xs font-medium tracking-wide text-neutral-700 uppercase">
              Разобрали
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h3 className="font-serif line-clamp-2 text-lg font-medium text-neutral-900">
          {product.name}
        </h3>
        <p className="mt-1 min-h-[2.5rem] line-clamp-2 text-xs leading-relaxed font-light tracking-normal text-neutral-500">
          {product.description}
        </p>
        <p className="mt-1.5 text-[11px] font-light text-neutral-400">{product.unit}</p>

        <div className="mt-auto pt-3">
          <div className="mb-2.5 flex items-baseline gap-2">
            <p className="text-sm font-semibold text-neutral-900 tabular-nums">
              {formatPrice(product.price)}
            </p>
            {product.originalPrice !== undefined && (
              <p className="text-xs text-neutral-400 line-through tabular-nums">
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>

          <div className="h-9">
            {soldOut ? (
              <div className="flex h-9 items-center justify-center rounded-full border border-[#EFEAE2] bg-[#FAF8F5] text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                Нет в наличии
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {quantity === 0 ? (
                  <motion.button
                    key="add"
                    type="button"
                    {...swap}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => cartStore.increment(product.id)}
                    aria-label={`Добавить в корзину: ${product.name}`}
                    className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-full bg-[#1A1A1A] px-4 text-xs font-medium tracking-wide text-white uppercase transition-all hover:opacity-90 active:scale-95"
                  >
                    <Plus className="size-3.5" strokeWidth={2} aria-hidden />
                    В корзину
                  </motion.button>
                ) : (
                  <motion.div key="stepper" {...swap} className="flex justify-end">
                    <QuantityStepper
                      variant="boutique"
                      size="sm"
                      value={quantity}
                      label={product.name}
                      onIncrement={() => cartStore.increment(product.id)}
                      onDecrement={() => cartStore.decrement(product.id)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export const ProductCard = memo(ProductCardBase);
