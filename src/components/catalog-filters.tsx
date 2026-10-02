"use client";

import { CATEGORIES, categoryLabel, uniqueBrands } from "@/lib/products";
import { RATING_OPTIONS, type CatalogQuery } from "@/lib/catalog";
import { fieldClass } from "@/components/field";
import type { Product } from "@/lib/types";

export function CatalogFilters({
  products,
  query,
  idPrefix,
  onChange,
  onReset,
}: {
  products: Product[];
  query: CatalogQuery;
  idPrefix: string;
  onChange: (partial: Partial<CatalogQuery>) => void;
  onReset: () => void;
}) {
  const brands = uniqueBrands(products);
  const prices = products.map((product) => product.price);
  const boundMin = Math.floor(Math.min(...prices));
  const boundMax = Math.ceil(Math.max(...prices));
  const min = query.min ?? boundMin;
  const max = query.max ?? boundMax;
  const span = Math.max(1, boundMax - boundMin);
  const left = ((min - boundMin) / span) * 100;
  const right = ((max - boundMin) / span) * 100;
  const dirty =
    query.category !== "" ||
    query.brands.length > 0 ||
    query.min != null ||
    query.max != null ||
    query.rating > 0 ||
    query.q !== "";

  function setMin(value: number) {
    if (query.max != null && value > query.max) onChange({ min: query.max, max: value });
    else onChange({ min: value });
  }

  function setMax(value: number) {
    if (query.min != null && value < query.min) onChange({ max: query.min, min: value });
    else onChange({ max: value });
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl leading-none">Filters</h2>
        {dirty ? (
          <button type="button" className="text-sm text-copper underline" onClick={onReset}>
            Reset
          </button>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Category</legend>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`${idPrefix}-category`}
              className="accent-forest"
              checked={query.category === ""}
              onChange={() => onChange({ category: "" })}
            />
            All
          </label>
          {CATEGORIES.map((category) => {
            const count = products.filter((product) => product.category === category.id).length;
            return (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${idPrefix}-category`}
                  className="accent-forest"
                  checked={query.category === category.id}
                  onChange={() => onChange({ category: category.id })}
                />
                <span className="flex-1">{category.label}</span>
                <span className="text-muted">{count}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Price, $</legend>
        <div className="dual-range mt-4">
          <div className="track" />
          <div className="track-fill" style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }} />
          <input type="range" min={boundMin} max={boundMax} value={min} aria-label="Minimum price" onChange={(event) => setMin(Number(event.target.value))} />
          <input type="range" min={boundMin} max={boundMax} value={max} aria-label="Maximum price" onChange={(event) => setMax(Number(event.target.value))} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-muted">
            From
            <input
              className={`${fieldClass} mt-1`}
              inputMode="decimal"
              value={query.min ?? ""}
              placeholder={String(boundMin)}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "") onChange({ min: null });
                else if (Number.isFinite(Number(raw))) setMin(Number(raw));
              }}
            />
          </label>
          <label className="text-xs text-muted">
            To
            <input
              className={`${fieldClass} mt-1`}
              inputMode="decimal"
              value={query.max ?? ""}
              placeholder={String(boundMax)}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "") onChange({ max: null });
                else if (Number.isFinite(Number(raw))) setMax(Number(raw));
              }}
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Brand</legend>
        <div className="mt-3 max-h-52 space-y-2 overflow-auto pr-1">
          {brands.map((brand) => {
            const count = products.filter((product) => product.brand === brand).length;
            const checked = query.brands.includes(brand);
            return (
              <label key={brand} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-forest"
                  checked={checked}
                  onChange={() =>
                    onChange({
                      brands: checked ? query.brands.filter((item) => item !== brand) : [...query.brands, brand],
                    })
                  }
                />
                <span className="flex-1">{brand}</span>
                <span className="text-muted">{count}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Rating</legend>
        <div className="mt-3 space-y-2">
          {RATING_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${idPrefix}-rating`}
                className="accent-forest"
                checked={query.rating === option.value}
                onChange={() => onChange({ rating: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {query.category ? <p className="sr-only">{categoryLabel(query.category)}</p> : null}
    </div>
  );
}
