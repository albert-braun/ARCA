"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductCard } from "@/components/product-card";
import { fieldClass } from "@/components/field";
import { IconClose } from "@/components/icons";
import { useDebounce } from "@/hooks/use-debounce";
import { SORT_OPTIONS, paginate, parseCatalogQuery, toSearchParams, type CatalogQuery, type IncomingSearch } from "@/lib/catalog";
import { categoryLabel } from "@/lib/products";
import { plural } from "@/lib/format";
import type { Product } from "@/lib/types";

const emptyQuery: CatalogQuery = { q: "", category: "", brands: [], min: null, max: null, rating: 0, sort: "popular", page: 1 };

function queryFromLocation(): CatalogQuery {
  const params = new URLSearchParams(window.location.search);
  const incoming: IncomingSearch = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    incoming[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return parseCatalogQuery(incoming);
}

export function CatalogExplorer({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(emptyQuery);
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebounce(searchText, 350);
  const debouncedQuery = useDebounce(query, 200);
  const origin = useRef<"user" | "url">("url");
  const lastHref = useRef<string | null>(null);

  useEffect(() => {
    if (origin.current !== "user") return;
    setQuery((current) => (current.q === debouncedSearch ? current : { ...current, q: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (origin.current === "url" && lastHref.current === null) {
      const fromUrl = queryFromLocation();
      lastHref.current = toSearchParams(fromUrl);
      if (fromUrl.q || fromUrl.category || fromUrl.brands.length || fromUrl.min != null || fromUrl.max != null || fromUrl.rating || fromUrl.sort !== "popular" || fromUrl.page > 1) {
        setSearchText(fromUrl.q);
        setQuery(fromUrl);
        return;
      }
    }
    const href = toSearchParams(debouncedQuery);
    if (lastHref.current === href) return;
    lastHref.current = href;
    const current = `${pathname}${window.location.search}`;
    if (current === href) return;
    router.replace(href, { scroll: false });
  }, [debouncedQuery, pathname, router]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  function patch(partial: Partial<CatalogQuery>, resetPage = true) {
    setQuery((current) => ({
      ...current,
      ...partial,
      page: resetPage ? 1 : (partial.page ?? current.page),
    }));
  }

  function reset() {
    origin.current = "user";
    setSearchText("");
    setQuery({ q: "", category: "", brands: [], min: null, max: null, rating: 0, sort: "popular", page: 1 });
  }

  const view = useMemo(() => paginate(products, query), [products, query]);
  const heading = query.category ? categoryLabel(query.category) : query.q ? `Search “${query.q}”` : "All items";
  const activeCount = [query.category, query.brands.length, query.min != null || query.max != null, query.rating > 0, query.q].filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Catalog</p>
          <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">{heading}</h1>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {view.filtered.length} {plural(view.filtered.length, "item", "items")}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <span className="sr-only">Search the catalog</span>
          <input
            value={searchText}
            placeholder="Search by brand, name, or category"
            className={`${fieldClass} rounded-full px-4`}
            onChange={(event) => {
              origin.current = "user";
              setSearchText(event.target.value);
            }}
          />
        </label>
        <label className="text-sm sm:w-64">
          <span className="sr-only">Sort</span>
          <select className={`${fieldClass} rounded-full`} value={query.sort} onChange={(event) => patch({ sort: event.target.value as CatalogQuery["sort"] })}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="rounded-full border border-line bg-card px-4 py-2.5 text-sm font-semibold lg:hidden" onClick={() => setFiltersOpen(true)}>
          Filters{activeCount ? ` · ${activeCount}` : ""}
        </button>
      </div>

      <ActiveChips query={query} onPatch={patch} onClearSearch={() => { origin.current = "user"; setSearchText(""); }} />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="sticky top-24 hidden rounded-2xl border border-line bg-card p-5 lg:block">
          <CatalogFilters products={products} query={query} idPrefix="desk" onChange={patch} onReset={reset} />
        </aside>
        <div>
          {view.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
              <p className="font-display text-4xl">Nothing matched</p>
              <p className="mt-2 text-sm text-muted">Loosen the filters or clear the search.</p>
              <button type="button" className="mt-5 text-sm font-semibold underline" onClick={reset}>
                Reset everything
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {view.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {view.pages > 1 ? (
            <nav className="mt-8 flex justify-center gap-2" aria-label="Pages">
              {Array.from({ length: view.pages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-current={page === view.page ? "page" : undefined}
                  className={`h-10 w-10 rounded-full text-sm ${page === view.page ? "bg-forest text-paper" : "border border-line bg-card"}`}
                  onClick={() => patch({ page }, false)}
                >
                  {page}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />
          <aside role="dialog" aria-modal="true" aria-label="Filters" className="absolute top-0 right-0 flex h-full w-full max-w-sm flex-col bg-paper">
            <div className="flex justify-end px-4 py-3">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-deep" aria-label="Close" onClick={() => setFiltersOpen(false)}>
                <IconClose />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 pb-6">
              <CatalogFilters products={products} query={query} idPrefix="mob" onChange={patch} onReset={reset} />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function ActiveChips({
  query,
  onPatch,
  onClearSearch,
}: {
  query: CatalogQuery;
  onPatch: (partial: Partial<CatalogQuery>) => void;
  onClearSearch: () => void;
}) {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (query.q) chips.push({ key: "q", label: `«${query.q}»`, clear: onClearSearch });
  if (query.category) chips.push({ key: "category", label: categoryLabel(query.category), clear: () => onPatch({ category: "" }) });
  query.brands.forEach((brand) =>
    chips.push({
      key: brand,
      label: brand,
      clear: () => onPatch({ brands: query.brands.filter((item) => item !== brand) }),
    }),
  );
  if (query.min != null || query.max != null) {
    chips.push({
      key: "price",
      label: `$${query.min ?? "…"}–$${query.max ?? "…"}`,
      clear: () => onPatch({ min: null, max: null }),
    });
  }
  if (query.rating) chips.push({ key: "rating", label: `rating ${query.rating}+`, clear: () => onPatch({ rating: 0 }) });
  if (chips.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button type="button" className="rounded-full bg-paper-deep px-3 py-1 text-sm" onClick={chip.clear}>
            {chip.label} <span aria-hidden>×</span>
            <span className="sr-only">Remove filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
