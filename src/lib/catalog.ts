import { categoryLabel } from "@/lib/products";
import type { Product } from "@/lib/types";

export type SortKey = "popular" | "rating" | "price-asc" | "price-desc";

export type CatalogQuery = {
  q: string;
  category: string;
  brands: string[];
  min: number | null;
  max: number | null;
  rating: number;
  sort: SortKey;
  page: number;
};

export type IncomingSearch = Record<string, string | string[] | undefined>;

export const PAGE_SIZE = 9;

export const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 3, label: "3.0 and up" },
  { value: 4, label: "4.0 and up" },
  { value: 4.5, label: "4.5 and up" },
] as const;

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const SORTS = new Set<SortKey>(["popular", "rating", "price-asc", "price-desc"]);

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function asList(value: string | string[] | undefined) {
  if (!value) return [];
  const source = Array.isArray(value) ? value : [value];
  return source.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean);
}

function asNumber(value: string | string[] | undefined) {
  const raw = first(value);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) return null;
  return parsed;
}

export function parseCatalogQuery(search: IncomingSearch): CatalogQuery {
  const sort = first(search.sort);
  const rating = Number(first(search.rating));
  const page = Number(first(search.page));
  return {
    q: first(search.q).slice(0, 80),
    category: first(search.category),
    brands: asList(search.brand),
    min: asNumber(search.min),
    max: asNumber(search.max),
    rating: [3, 4, 4.5].includes(rating) ? rating : 0,
    sort: SORTS.has(sort as SortKey) ? (sort as SortKey) : "popular",
    page: Number.isFinite(page) && page > 0 ? Math.min(100, Math.floor(page)) : 1,
  };
}

export function toSearchParams(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  query.brands.forEach((brand) => params.append("brand", brand));
  if (query.min != null) params.set("min", String(query.min));
  if (query.max != null) params.set("max", String(query.max));
  if (query.rating) params.set("rating", String(query.rating));
  if (query.sort !== "popular") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const value = params.toString();
  return value ? `/catalog?${value}` : "/catalog";
}

export function filterProducts(products: Product[], query: CatalogQuery) {
  const needle = query.q.trim().toLowerCase();
  const list = products.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (query.brands.length > 0 && !query.brands.includes(product.brand)) return false;
    if (query.min != null && product.price < query.min) return false;
    if (query.max != null && product.price > query.max) return false;
    if (query.rating && product.rating.rate < query.rating) return false;
    if (!needle) return true;
    const haystack = `${product.title} ${product.description} ${product.brand} ${categoryLabel(product.category)}`.toLowerCase();
    return haystack.includes(needle);
  });

  return [...list].sort((a, b) => {
    if (query.sort === "rating") return b.rating.rate - a.rating.rate || b.rating.count - a.rating.count;
    if (query.sort === "price-asc") return a.price - b.price;
    if (query.sort === "price-desc") return b.price - a.price;
    return b.rating.count - a.rating.count;
  });
}

export function paginate(products: Product[], query: CatalogQuery) {
  const filtered = filterProducts(products, query);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  return { filtered, pages, page, items: filtered.slice(start, start + PAGE_SIZE) };
}
