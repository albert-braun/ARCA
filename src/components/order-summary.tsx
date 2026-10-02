"use client";

import { useEffect, useState } from "react";
import { fieldClass } from "@/components/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatMoney } from "@/lib/format";
import { PROMO_CODE, quote } from "@/lib/pricing";
import type { DeliveryMethod } from "@/lib/types";
import { selectSubtotal, useCartStore } from "@/store/cart-store";

export function OrderSummary({ delivery = "courier" }: { delivery?: DeliveryMethod }) {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const promo = useCartStore((state) => state.promo);
  const setPromo = useCartStore((state) => state.setPromo);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated) setDraft(promo);
  }, [hydrated, promo]);

  const readyItems = hydrated ? items : [];
  const totals = quote(selectSubtotal(readyItems), promo, delivery);

  function apply() {
    const code = draft.trim().toUpperCase();
    if (!code) {
      setPromo("");
      setError("");
      return;
    }
    if (code !== PROMO_CODE) {
      setError("That code does not exist");
      return;
    }
    setPromo(code);
    setDraft(code);
    setError("");
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-display text-3xl leading-none">Summary</h2>
      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Items</dt>
          <dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Discount</dt>
          <dd className="tabular-nums">{totals.discount ? `−${formatMoney(totals.discount)}` : formatMoney(0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd className="tabular-nums">{totals.shipping === 0 ? "Free" : formatMoney(totals.shipping)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
        <p className="text-sm text-muted">Amount due</p>
        <p className="font-display text-4xl tabular-nums">{formatMoney(totals.total)}</p>
      </div>
      <div className="mt-5">
        {promo ? (
          <p className="flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-sm">
            <span>Promo code {promo}</span>
            <button type="button" className="underline" onClick={() => { setPromo(""); setDraft(""); setError(""); }}>
              Remove
            </button>
          </p>
        ) : (
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="promo">Promo code</label>
            <input
              id="promo"
              value={draft}
              placeholder={PROMO_CODE}
              className={fieldClass}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  apply();
                }
              }}
            />
            <button type="button" className="rounded-xl bg-ink px-4 text-sm font-semibold text-paper" onClick={apply}>
              Apply
            </button>
          </div>
        )}
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </div>
    </section>
  );
}
