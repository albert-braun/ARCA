import fallback from "@/data/products.json";
import { EXTRA_PRODUCTS } from "@/data/extra-products";
import type { Product, RawProduct } from "@/lib/types";

const SOURCE = "https://fakestoreapi.com/products";

const BRAND_BY_ID: Record<number, string> = {
  1: "Fjällräven",
  2: "Northline",
  3: "Northline",
  4: "Northline",
  5: "John Hardy",
  6: "Hafeez",
  7: "Aurelia",
  8: "Pierced Owl",
  9: "WD",
  10: "SanDisk",
  11: "Silicon Power",
  12: "WD",
  13: "Acer",
  14: "Samsung",
  15: "BIYLACLESEN",
  16: "Lock & Love",
  17: "Trailform",
  18: "MBJ",
  19: "Opna",
  20: "Danvouy",
};

export const CATEGORIES = [
  { id: "men's clothing", label: "Men's clothing", note: "Coats, denim, shirts, packs" },
  { id: "women's clothing", label: "Women's clothing", note: "Dresses, coats, linen, knits" },
  { id: "jewelery", label: "Jewelry", note: "Rings, chains, cuffs, earrings" },
  { id: "electronics", label: "Electronics", note: "Screens, audio, and storage" },
] as const;

export function categoryLabel(id: string) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

function isRawProduct(value: unknown): value is RawProduct {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RawProduct>;
  return (
    typeof item.id === "number" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    typeof item.description === "string" &&
    typeof item.category === "string" &&
    typeof item.image === "string" &&
    !!item.rating &&
    typeof item.rating.rate === "number" &&
    typeof item.rating.count === "number"
  );
}

export function enrich(raw: RawProduct & { brand?: string }): Product {
  const { brand, ...rest } = raw;
  return {
    ...rest,
    title: rest.title.trim(),
    description: rest.description.trim(),
    brand: brand ?? BRAND_BY_ID[rest.id] ?? "ARCA",
  };
}

function fromList(data: unknown) {
  if (!Array.isArray(data)) throw new Error("Unexpected catalog payload");
  return data.filter(isRawProduct).map(enrich);
}

function withExtras(products: Product[]) {
  const ids = new Set(products.map((product) => product.id));
  const extras = EXTRA_PRODUCTS.filter((product) => !ids.has(product.id)).map(enrich);
  return [...products, ...extras];
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(SOURCE, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`FakeStoreAPI ${response.status}`);
    return withExtras(fromList(await response.json()));
  } catch {
    return withExtras(fromList(fallback));
  }
}

export async function getProduct(id: number) {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}

export function uniqueBrands(products: Product[]) {
  return [...new Set(products.map((product) => product.brand))].sort((a, b) => a.localeCompare(b, "en"));
}
