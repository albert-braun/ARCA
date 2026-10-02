"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type Notice = { id: number; text: string };

type CartState = {
  items: CartItem[];
  promo: string;
  notice: Notice | null;
  drawerOpen: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  setPromo: (promo: string) => void;
  clear: () => void;
  setNotice: (notice: Notice | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promo: "",
      notice: null,
      drawerOpen: false,
      add: (item, qty = 1) =>
        set((state) => {
          const amount = Math.max(1, Math.min(9, qty));
          const existing = state.items.find((entry) => entry.productId === item.productId);
          const items = existing
            ? state.items.map((entry) =>
                entry.productId === item.productId ? { ...entry, qty: Math.min(9, entry.qty + amount) } : entry,
              )
            : [...state.items, { ...item, qty: amount }];
          return {
            items,
            notice: { id: Date.now(), text: "Added to cart" },
          };
        }),
      setQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((entry) => entry.productId !== productId)
              : state.items.map((entry) =>
                  entry.productId === productId ? { ...entry, qty: Math.min(9, qty) } : entry,
                ),
        })),
      remove: (productId) => set((state) => ({ items: state.items.filter((entry) => entry.productId !== productId) })),
      setPromo: (promo) => set({ promo }),
      clear: () => set({ items: [], promo: "" }),
      setNotice: (notice) => set({ notice }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "arca-cart",
      skipHydration: true,
      partialize: (state) => ({ items: state.items, promo: state.promo }),
    },
  ),
);

export function selectSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function selectCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
