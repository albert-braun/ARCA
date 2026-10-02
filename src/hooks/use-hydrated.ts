"use client";

import { useEffect, useState } from "react";
import { useAccountStore } from "@/store/account-store";
import { useCartStore } from "@/store/cart-store";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      await useCartStore.persist.rehydrate();
      await useAccountStore.persist.rehydrate();
      if (active) setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  return hydrated;
}
