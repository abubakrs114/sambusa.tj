"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { CartUiProvider } from "@/context/cart-ui";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartUiProvider>{children}</CartUiProvider>
    </MotionConfig>
  );
}
