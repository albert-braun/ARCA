"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/button";
import { IconClose } from "@/components/icons";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatMoney, plural } from "@/lib/format";
import { quote } from "@/lib/pricing";
import { selectCount, selectSubtotal, useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const hydrated = useHydrated();
  const open = useCartStore((state) => state.drawerOpen);
  const close = useCartStore((state) => state.closeDrawer);
  const items = useCartStore((state) => state.items);
  const promo = useCartStore((state) => state.promo);
  const setQty = useCartStore((state) => state.setQty);
  const remove = useCartStore((state) => state.remove);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  const ready = hydrated ? items : [];
  const subtotal = selectSubtotal(ready);
  const count = selectCount(ready);
  const totals = quote(subtotal, promo, "courier");

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close cart" onClick={close} />
      <aside role="dialog" aria-modal="true" aria-label="Cart" className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="font-display text-3xl leading-none">Cart</p>
            <p className="mt-1 text-sm text-muted">
              {count} {plural(count, "item", "items")}
            </p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-deep" aria-label="Close" onClick={close}>
            <IconClose />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-auto px-5 py-4">
          {ready.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center">
              <p className="font-display text-3xl">Nothing here yet</p>
              <Link href="/catalog" className={`${buttonClass("primary")} mt-4`} onClick={close}>
                Browse the catalog
              </Link>
            </div>
          ) : (
            ready.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <Link href={`/product/${item.productId}`} onClick={close} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-deep">
                  <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.productId}`} onClick={close} className="line-clamp-2 text-sm font-medium">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{item.brand}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button type="button" className="h-8 w-8" aria-label="Decrease quantity" onClick={() => setQty(item.productId, item.qty - 1)}>−</button>
                      <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
                      <button type="button" className="h-8 w-8" aria-label="Increase quantity" onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
                    </div>
                    <p className="text-sm tabular-nums">{formatMoney(item.price * item.qty)}</p>
                  </div>
                  <button type="button" className="mt-1 text-xs text-muted underline" onClick={() => remove(item.productId)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {ready.length > 0 ? (
          <div className="border-t border-line px-5 py-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted">Total with courier</p>
                <p className="font-display text-4xl tabular-nums">{formatMoney(totals.total)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/cart" className={buttonClass("ghost")} onClick={close}>More details</Link>
              <Link href="/checkout" className={buttonClass("primary")} onClick={close}>Checkout</Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
