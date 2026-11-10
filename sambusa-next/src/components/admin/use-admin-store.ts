"use client";

import { useCallback, useState } from "react";

import { readApiError } from "@/lib/admin-fetch";
import type { DataStore } from "@/types/store";

export function useAdminStore(initial?: DataStore) {
  const [store, setStore] = useState<DataStore | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/store", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const data = (await response.json()) as DataStore;
      setStore(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка загрузки. Проверьте вход и соединение.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { store, loading, error, reload, setStore };
}
