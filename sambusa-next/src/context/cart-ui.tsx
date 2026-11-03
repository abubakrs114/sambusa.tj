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

interface CartUiValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  orderSentVisible: boolean;
  notifyOrderSent: () => void;
  dismissOrderSent: () => void;
}

const CartUiContext = createContext<CartUiValue | null>(null);

const TOAST_MS = 5500;

/** Состояние корзины/оформления и тост об успешной отправке в WhatsApp. */
export function CartUiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderSentVisible, setOrderSentVisible] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const notifyOrderSent = useCallback(() => setOrderSentVisible(true), []);
  const dismissOrderSent = useCallback(() => setOrderSentVisible(false), []);

  useEffect(() => {
    if (!orderSentVisible) return;
    const timer = window.setTimeout(() => setOrderSentVisible(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [orderSentVisible]);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      orderSentVisible,
      notifyOrderSent,
      dismissOrderSent,
    }),
    [isOpen, open, close, orderSentVisible, notifyOrderSent, dismissOrderSent],
  );

  return <CartUiContext.Provider value={value}>{children}</CartUiContext.Provider>;
}

export function useCartUi(): CartUiValue {
  const context = useContext(CartUiContext);
  if (!context) throw new Error("useCartUi must be used inside <CartUiProvider>");
  return context;
}
