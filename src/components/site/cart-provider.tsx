"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MAX_QTY_PER_BOOK } from "@/lib/limits";
import { formatPrice } from "@/lib/format";

export type CartItem = {
  bookId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  unavailable?: boolean;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  hasUnavailable: boolean;
  notices: string[];
  clearNotices: () => void;
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
const cap = (qty: number, stock: number) => Math.max(1, Math.min(qty, stock, MAX_QTY_PER_BOOK));

function parseSaved(raw: string | null): CartItem[] {
  try {
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    if (!Array.isArray(parsed)) return [];
    // Carts saved before the per-book limit existed (or hand-edited) are trimmed to it.
    return parsed
      .filter((i) => i && typeof i.bookId === "string" && typeof i.price === "number")
      .map((i) => ({ ...i, quantity: cap(Number(i.quantity) || 1, Number(i.stock) || 1) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  const syncing = useRef(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount to keep SSR markup stable
      setItems(parseSaved(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // Storage unavailable — start with an empty cart.
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
  }, [items, ready]);

  // Keep several open tabs in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(parseSaved(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Re-check prices, stock and availability against the database.
  const sync = useCallback(async () => {
    if (syncing.current) return;
    const snapshot = items;
    if (snapshot.length === 0) return;
    syncing.current = true;
    try {
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: snapshot.map((i) => i.bookId) }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) return; // offline / server hiccup: keep the cart as is
      const live = new Map<string, { slug: string; title: string; price: number; stock: number; image: string }>(
        payload.data.items.map((b: { bookId: string }) => [b.bookId, b])
      );
      const found: string[] = [];
      const next = snapshot.map((item) => {
        const book = live.get(item.bookId);
        if (!book || book.stock <= 0) {
          if (!item.unavailable) found.push(`"${item.title}" is ${book ? "out of stock" : "no longer available"}.`);
          return { ...item, unavailable: true, stock: book?.stock ?? 0 };
        }
        const quantity = cap(item.quantity, book.stock);
        if (book.price !== item.price) found.push(`The price of "${book.title}" changed from ${formatPrice(item.price)} to ${formatPrice(book.price)}.`);
        if (quantity < item.quantity) found.push(`Only ${quantity} ${quantity === 1 ? "copy" : "copies"} of "${book.title}" can be ordered right now.`);
        return { ...item, ...book, bookId: item.bookId, quantity, unavailable: false };
      });
      if (JSON.stringify(next) !== JSON.stringify(snapshot)) setItems(next);
      if (found.length) setNotices((prev) => [...new Set([...prev, ...found])]);
    } catch {
      // network error — leave the cart untouched
    } finally {
      syncing.current = false;
    }
  }, [items]);

  // Validate once after load and every time the mini-cart opens.
  const syncRef = useRef(sync);
  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);
  useEffect(() => {
    if (ready) void syncRef.current();
  }, [ready, drawerOpen]);

  const value = useMemo<CartContextValue>(() => {
    const live = items.filter((i) => !i.unavailable);
    return {
      items,
      ready,
      notices,
      clearNotices: () => setNotices([]),
      hasUnavailable: items.some((i) => i.unavailable),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      count: live.reduce((n, i) => n + i.quantity, 0),
      subtotal: live.reduce((sum, i) => sum + i.price * i.quantity, 0),
      add(item, quantity = 1) {
        setDrawerOpen(true);
        setItems((prev) => {
          const existing = prev.find((i) => i.bookId === item.bookId);
          if (!existing) return [...prev, { ...item, unavailable: false, quantity: cap(quantity, item.stock) }];
          return prev.map((i) =>
            i.bookId === item.bookId
              ? { ...i, ...item, unavailable: false, quantity: cap(i.quantity + quantity, item.stock) }
              : i
          );
        });
      },
      setQuantity(bookId, quantity) {
        setItems((prev) => prev.map((i) => (i.bookId === bookId ? { ...i, quantity: cap(quantity, i.stock) } : i)));
      },
      remove(bookId) {
        setItems((prev) => prev.filter((i) => i.bookId !== bookId));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items, ready, drawerOpen, notices]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
