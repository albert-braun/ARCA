import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { parseCatalogQuery, type IncomingSearch } from "@/lib/catalog";
import { getProducts } from "@/lib/products";

type Props = {
  searchParams: Promise<IncomingSearch>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams);
  if (query.q) {
    return {
      title: `Search: ${query.q}`,
      description: `Search results for “${query.q}” in the ARCA catalog.`,
    };
  }
  return {
    title: "Catalog",
    description: "Price, brand, and rating filters, sorting, and debounced search.",
  };
}

export default async function CatalogPage({ searchParams }: Props) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  return <CatalogExplorer products={products} initialQuery={parseCatalogQuery(params)} />;
}
