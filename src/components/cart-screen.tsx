"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/button";
import { OrderSummary } from "@/components/order-summary";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatMoney, plural } from "@/lib/format";
import { FREE_SHIPPING_FROM } from "@/lib/pricing";
import { selectCount, selectSubtotal, useCartStore } from "@/store/cart-store";

export function CartScreen() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const setQty = useCartStore((state) => state.setQty);
  const remove = useCartStore((state) => state.remove);

  if (!hydrated) return <p className="mx-auto max-w-[1200px] px-4 py-16 text-muted sm:px-6">Opening your cart…</p>;

  const subtotal = selectSubtotal(items);
  const count = selectCount(items);
  const left = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Cart</p>
      <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Your order</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-display text-4xl">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted">Add something from the catalog and the total updates at once.</p>
          <Link href="/catalog" className="mt-6 inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper">
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-sm">{left === 0 ? "Courier shipping is already free." : `${formatMoney(left)} more until free courier.`}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep">
                <div className="h-full bg-forest" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 p-4">
                  <Link href={`/product/${item.productId}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-paper-deep">
                    <Image src={item.image} alt="" fill sizes="96px" className="object-contain p-2" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs tracking-[0.14em] text-muted uppercase">{item.brand}</p>
                    <Link href={`/product/${item.productId}`} className="mt-1 block font-medium">{item.title}</Link>
                    <p className="mt-1 text-sm text-muted">{formatMoney(item.price)} each</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-line">
                        <button type="button" className="h-9 w-9" aria-label="Decrease quantity" onClick={() => setQty(item.productId, item.qty - 1)}>−</button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
                        <button type="button" className="h-9 w-9" aria-label="Increase quantity" disabled={item.qty >= 9} onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
                      </div>
                      <p className="font-display text-3xl tabular-nums">{formatMoney(item.price * item.qty)}</p>
                    </div>
                    <button type="button" className="mt-2 text-sm text-muted underline" onClick={() => remove(item.productId)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">
              {count} {plural(count, "item", "items")}. The summary includes the promo code and courier shipping. You can change the method at checkout and the total will update.
            </p>
          </div>
          <div className="space-y-4 lg:sticky lg:top-24">
            <OrderSummary />
            <Link href="/checkout" className={`${buttonClass()} w-full`}>
              Go to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
