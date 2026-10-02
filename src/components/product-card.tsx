"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/button";
import { Stars } from "@/components/stars";
import { categoryLabel } from "@/lib/products";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((state) => state.add);
  const [broken, setBroken] = useState(false);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-line bg-card transition hover:-translate-y-0.5 hover:border-ink/20">
      <Link href={`/product/${product.id}`} className="block">
        <span className="relative block aspect-[4/5] overflow-hidden rounded-t-2xl bg-paper-deep">
          {broken ? (
            <span className="grid h-full place-items-center font-display text-3xl text-muted">ARCA</span>
          ) : (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 100vw"
              className="object-contain p-6 transition duration-300 group-hover:scale-[1.03]"
              onError={() => setBroken(true)}
            />
          )}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          <span>{product.brand}</span>
          <span>{categoryLabel(product.category)}</span>
        </div>
        <Link href={`/product/${product.id}`} className="font-display text-[1.7rem] leading-none">
          <span className="line-clamp-2">{product.title}</span>
        </Link>
        <Stars value={product.rating.rate} count={product.rating.count} />
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="font-display text-3xl tabular-nums">{formatMoney(product.price)}</p>
          <Button
            className="px-4"
            onClick={() =>
              add({
                productId: product.id,
                title: product.title,
                brand: product.brand,
                price: product.price,
                image: product.image,
              })
            }
          >
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
}
