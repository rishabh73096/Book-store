"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  bookId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  remove: (bookId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "book-store-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount to keep SSR markup stable
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Corrupt or unavailable storage — start with an empty cart.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Cart just won't persist across reloads.
    }
  }, [items, ready, drawerOpen]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      add(item, quantity = 1) {
        setDrawerOpen(true);
        setItems((prev) => {
          const existing = prev.find((i) => i.bookId === item.bookId);
          if (!existing) return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
          return prev.map((i) =>
            i.bookId === item.bookId
              ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.stock) }
              : i
          );
        });
      },
      setQuantity(bookId, quantity) {
        setItems((prev) =>
          prev.map((i) =>
            i.bookId === bookId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
          )
        );
      },
      remove(bookId) {
        setItems((prev) => prev.filter((i) => i.bookId !== bookId));
      },
      clear() {
        setItems([]);
      },
    }),
    [items, ready, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
