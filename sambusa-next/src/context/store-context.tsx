"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { setStorefrontCatalog } from "@/lib/catalog-registry";
import type { StorefrontPayload } from "@/types/store";

interface StoreContextValue extends StorefrontPayload {
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  initial,
  children,
}: {
  initial: StorefrontPayload;
  children: ReactNode;
}) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    setStorefrontCatalog(initial.products);
  }, [initial]);

  const apply = useCallback((payload: StorefrontPayload) => {
    setStorefrontCatalog(payload.products);
    setData(payload);
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/store", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as StorefrontPayload;
    apply(payload);
  }, [apply]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...data,
      refresh,
    }),
    [data, refresh],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStorefront(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStorefront must be used within StoreProvider");
  }
  return ctx;
}
