import { getStorefrontProduct, hasStorefrontProduct } from "@/lib/catalog-registry";
import type { CartLine } from "@/types";

/**
 * Лёгкий внешний стор корзины для useSyncExternalStore.
 * - без регистрации: состояние живёт в localStorage;
 * - SSR-безопасен: на сервере всегда пустая корзина;
 * - синхронизируется между вкладками.
 */

const STORAGE_KEY = "sambusa.cart.v1";
export const MAX_QUANTITY = 20;

const EMPTY: readonly CartLine[] = Object.freeze([]);

let lines: readonly CartLine[] = EMPTY;
let hydrated = false;
/** Увеличивается при каждом добавлении в корзину — для анимации иконки в шапке. */
let cartPulse = 0;
const listeners = new Set<() => void>();

function bumpCartPulse(): void {
  cartPulse += 1;
  listeners.forEach((listener) => listener());
}

function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const result: CartLine[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { productId, quantity } = entry as Partial<CartLine>;
    if (typeof productId !== "string" || !hasStorefrontProduct(productId)) continue;
    if (!Number.isInteger(quantity) || (quantity as number) < 1) continue;
    result.push({
      productId,
      quantity: Math.min(quantity as number, MAX_QUANTITY),
    });
  }
  return result;
}

function readStorage(): readonly CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? sanitize(JSON.parse(raw)) : [];
    return parsed.length ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

function ensureHydrated(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  lines = readStorage();
}

function commit(next: readonly CartLine[]): void {
  lines = next.length ? next : EMPTY;
  try {
    if (lines.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Приватный режим / переполнение — корзина просто не переживёт перезагрузку.
  }
  listeners.forEach((listener) => listener());
}

function getQuantity(productId: string): number {
  return lines.find((line) => line.productId === productId)?.quantity ?? 0;
}

function setQuantity(productId: string, quantity: number): void {
  ensureHydrated();
  const product = getStorefrontProduct(productId);
  if (!product || !product.inStock) return;
  if (!hasStorefrontProduct(productId)) return;
  const next = Math.max(0, Math.min(MAX_QUANTITY, Math.floor(quantity)));
  const exists = lines.some((line) => line.productId === productId);

  if (next === 0) {
    if (exists) commit(lines.filter((line) => line.productId !== productId));
    return;
  }
  const prevQty = getQuantity(productId);
  if (exists) {
    commit(
      lines.map((line) =>
        line.productId === productId ? { ...line, quantity: next } : line,
      ),
    );
  } else {
    commit([...lines, { productId, quantity: next }]);
  }
  if (next > prevQty) bumpCartPulse();
}

function onStorage(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  lines = readStorage();
  listeners.forEach((listener) => listener());
}

export const cartStore = {
  subscribe(listener: () => void): () => void {
    ensureHydrated();
    if (listeners.size === 0) window.addEventListener("storage", onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): readonly CartLine[] {
    ensureHydrated();
    return lines;
  },
  getServerSnapshot(): readonly CartLine[] {
    return EMPTY;
  },
  getQuantity(productId: string): number {
    ensureHydrated();
    return getQuantity(productId);
  },
  getCartPulse(): number {
    ensureHydrated();
    return cartPulse;
  },
  setQuantity,
  increment(productId: string): void {
    ensureHydrated();
    setQuantity(productId, getQuantity(productId) + 1);
  },
  decrement(productId: string): void {
    ensureHydrated();
    setQuantity(productId, getQuantity(productId) - 1);
  },
  clear(): void {
    ensureHydrated();
    commit(EMPTY);
  },
};
