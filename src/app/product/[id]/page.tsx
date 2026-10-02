import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { Stars } from "@/components/stars";
import { formatMoney } from "@/lib/format";
import { categoryLabel, getProduct, getProducts } from "@/lib/products";
import { FREE_SHIPPING_FROM } from "@/lib/pricing";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/product/${product.id}` },
    openGraph: { images: [{ url: product.image, alt: product.title }] },
  };
}

export const revalidate = 3600;

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();
  const products = await getProducts();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.image,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating.rate,
      reviewCount: product.rating.count,
    },
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/catalog" className="hover:text-ink">Catalog</Link>
        <span aria-hidden>/</span>
        <Link href={`/catalog?category=${encodeURIComponent(product.category)}`} className="hover:text-ink">
          {categoryLabel(product.category)}
        </Link>
      </nav>
      <article className="mt-6 grid items-start gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-paper-deep">
          <Image src={product.image} alt={product.title} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-contain p-10" />
        </div>
        <div>
          <Link href={`/catalog?brand=${encodeURIComponent(product.brand)}`} className="text-xs font-semibold tracking-[0.18em] text-copper uppercase hover:underline">
            {product.brand}
          </Link>
          <h1 className="mt-3 font-display text-5xl leading-[1.02]">{product.title}</h1>
          <div className="mt-4">
            <Stars value={product.rating.rate} count={product.rating.count} />
          </div>
          <p className="mt-6 font-display text-5xl tabular-nums">{formatMoney(product.price)}</p>
          <p className="mt-6 max-w-xl text-sm leading-7 text-muted">{product.description}</p>
          <div className="mt-8">
            <AddToCart product={product} />
          </div>
          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>In stock, up to 9 per cart.</li>
            <li>Free courier from ${FREE_SHIPPING_FROM}.</li>
          </ul>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-4xl">More in this category</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
