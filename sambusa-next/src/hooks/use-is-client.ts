"use client";

import { useSyncExternalStore } from "react";

/** true только после гидратации на клиенте — без mismatch с SSR. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
