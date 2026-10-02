"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sha256 } from "@/lib/hash";
import type { Order, Profile, StoredUser } from "@/lib/types";

type AccountState = {
  user: Profile | null;
  users: StoredUser[];
  orders: Order[];
  register: (input: { name: string; email: string; password: string }) => Promise<"ok" | "exists">;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (patch: Omit<Profile, "id" | "email">) => void;
  placeOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Order;
};

function toProfile(user: StoredUser): Profile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    street: user.street,
    apartment: user.apartment,
    postal: user.postal,
  };
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      orders: [],
      register: async ({ name, email, password }) => {
        const normalized = email.trim().toLowerCase();
        if (get().users.some((entry) => entry.email.toLowerCase() === normalized)) return "exists";
        const next: StoredUser = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: email.trim(),
          phone: "",
          city: "",
          street: "",
          apartment: "",
          postal: "",
          passwordHash: await sha256(password),
        };
        set((state) => ({ users: [...state.users, next], user: toProfile(next) }));
        return "ok";
      },
      login: async (email, password) => {
        const hash = await sha256(password);
        const found = get().users.find(
          (entry) => entry.email.toLowerCase() === email.trim().toLowerCase() && entry.passwordHash === hash,
        );
        if (!found) return false;
        set({ user: toProfile(found) });
        return true;
      },
      logout: () => set({ user: null }),
      updateProfile: (patch) =>
        set((state) => {
          if (!state.user) return state;
          const user = { ...state.user, ...patch };
          return {
            user,
            users: state.users.map((entry) => (entry.id === user.id ? { ...entry, ...patch } : entry)),
          };
        }),
      placeOrder: (input) => {
        const order: Order = {
          ...input,
          id: `AR-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
          status: "processing",
        };
        set((state) => ({ orders: [order, ...state.orders].slice(0, 30) }));
        return order;
      },
    }),
    {
      name: "arca-account",
      skipHydration: true,
      partialize: (state) => ({ user: state.user, users: state.users, orders: state.orders }),
    },
  ),
);
