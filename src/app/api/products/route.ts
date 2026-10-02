import { getProducts } from "@/lib/products";

export async function GET() {
  const products = await getProducts();
  return Response.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
