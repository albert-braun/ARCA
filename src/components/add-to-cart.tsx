"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

export function AddToCart({ product }: { product: Product }) {
  const add = useCartStore((state) => state.add);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-line bg-card">
        <button type="button" className="h-11 w-11 text-lg" aria-label="Decrease quantity" onClick={() => setQty((value) => Math.max(1, value - 1))}>
          −
        </button>
        <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button type="button" className="h-11 w-11 text-lg" aria-label="Increase quantity" onClick={() => setQty((value) => Math.min(9, value + 1))}>
          +
        </button>
      </div>
      <Button
        className="h-11 px-6"
        onClick={() => {
          add(
            {
              productId: product.id,
              title: product.title,
              brand: product.brand,
              price: product.price,
              image: product.image,
            },
            qty,
          );
          openDrawer();
        }}
      >
        Add to cart
      </Button>
    </div>
  );
}
