import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Price, brand, and rating filters, sorting, and debounced search.",
};

export default async function CatalogPage() {
  const products = await getProducts();
  return <CatalogExplorer products={products} />;
}
