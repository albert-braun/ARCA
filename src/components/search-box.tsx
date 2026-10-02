"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconSearch } from "@/components/icons";
import { useDebounce } from "@/hooks/use-debounce";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";

let productCache: Product[] | null = null;

async function loadProducts() {
  if (productCache) return productCache;
  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("search failed");
  const data = (await response.json()) as Product[];
  productCache = data;
  return data;
}

export function SearchBox({ autoFocus = false, onNavigate }: { autoFocus?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Product[] | null>(productCache);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const debounced = useDebounce(text, 350);
  const waiting = text.trim().length >= 2 && text.trim() !== debounced.trim();

  useEffect(() => {
    if (!open || items) return;
    let cancelled = false;
    loadProducts()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, items]);

  const results = useMemo(() => {
    if (!items || debounced.trim().length < 2) return [];
    const needle = debounced.trim().toLowerCase();
    return items
      .filter((product) => `${product.title} ${product.brand} ${product.category}`.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [items, debounced]);

  useEffect(() => {
    setActive(0);
  }, [debounced]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function goToCatalog() {
    const query = text.trim();
    setOpen(false);
    onNavigate?.();
    router.push(query ? `/catalog?q=${encodeURIComponent(query)}` : "/catalog");
  }

  function goToProduct(id: number) {
    setOpen(false);
    onNavigate?.();
    router.push(`/product/${id}`);
  }

  const showList = open && text.trim().length >= 2;
  const activeId = results[active] ? `${listId}-${results[active].id}` : undefined;

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (showList && results[active]) goToProduct(results[active].id);
          else goToCatalog();
        }}
      >
        <label className="relative block">
          <span className="sr-only">Search the catalog</span>
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={text}
            autoFocus={autoFocus}
            placeholder="Find a backpack, monitor, ring"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList ? activeId : undefined}
            className="w-full rounded-full border border-line bg-card py-2.5 pr-4 pl-10 text-sm outline-none focus:border-forest"
            onChange={(event) => {
              setText(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (!showList || results.length === 0) {
                if (event.key === "Escape") setOpen(false);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(results.length - 1, index + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(0, index - 1));
              }
              if (event.key === "Escape") setOpen(false);
            }}
          />
        </label>
      </form>
      {showList ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
          {waiting || (!items && !failed) ? <p className="px-4 py-3 text-sm text-muted">Searching…</p> : null}
          {failed ? <p className="px-4 py-3 text-sm text-danger">Could not load the catalog</p> : null}
          {!waiting && items && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">Nothing matched. Try a brand or a category.</p>
          ) : null}
          {results.length > 0 ? (
            <ul id={listId} role="listbox" className="max-h-80 overflow-auto py-1">
              {results.map((product, index) => (
                <li key={product.id} role="option" id={`${listId}-${product.id}`} aria-selected={index === active}>
                  <Link
                    href={`/product/${product.id}`}
                    className={`flex items-center gap-3 px-3 py-2 ${index === active ? "bg-paper" : ""}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper-deep">
                      <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{product.title}</span>
                      <span className="text-xs text-muted">{product.brand}</span>
                    </span>
                    <span className="text-sm tabular-nums">{formatMoney(product.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <button type="button" className="w-full border-t border-line px-4 py-2.5 text-left text-sm font-medium" onMouseDown={(event) => event.preventDefault()} onClick={goToCatalog}>
            All results in the catalog
          </button>
        </div>
      ) : null}
    </div>
  );
}
