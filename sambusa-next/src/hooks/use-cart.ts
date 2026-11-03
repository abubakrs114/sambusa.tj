"use client";

import { useMemo, useSyncExternalStore } from "react";

import { getStorefrontProduct } from "@/lib/catalog-registry";
import { cartStore } from "@/lib/cart-store";
import type { CartItem } from "@/types";
import type { StorefrontProduct } from "@/types/store";

export interface CartSummary {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
}

function toCartProduct(display: StorefrontProduct) {
  return {
    id: display.id,
    name: display.name,
    description: display.description,
    section: display.section,
    price: display.price,
    unit: display.unit,
    image: display.image,
    drink: display.drink,
    placeholder: display.placeholder,
    badge: display.badge,
  };
}

/** Вся корзина: позиции, количество и сумма. */
export function useCart(): CartSummary {
  const lines = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  return useMemo(() => {
    const items: CartItem[] = [];
    let totalCount = 0;
    let totalPrice = 0;
    for (const line of lines) {
      const display = getStorefrontProduct(line.productId);
      if (!display || !display.inStock) continue;
      const product = toCartProduct(display);
      const lineTotal = product.price * line.quantity;
      items.push({ product, quantity: line.quantity, lineTotal });
      totalCount += line.quantity;
      totalPrice += lineTotal;
    }
    return { items, totalCount, totalPrice };
  }, [lines]);
}

/** Количество одной позиции — перерисовывает только затронутую карточку. */
export function useProductQuantity(productId: string): number {
  return useSyncExternalStore(
    cartStore.subscribe,
    () => cartStore.getQuantity(productId),
    () => 0,
  );
}
