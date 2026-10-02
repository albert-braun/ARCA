import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/button";
import { ProductCard } from "@/components/product-card";
import { plural } from "@/lib/format";
import { CATEGORIES, categoryLabel, getProducts, uniqueBrands } from "@/lib/products";
import { FREE_SHIPPING_FROM, PROMO_CODE } from "@/lib/pricing";

export const revalidate = 3600;

const STORIES = [
  {
    kicker: "Cloth",
    title: "Wool that does not shine",
    text: "Coats in this shop are cut from boiled or double-faced wool. They hold a shape on a hanger and stay quiet under street light, without a finish that reads as new for one season.",
    href: "/catalog?category=women%27s%20clothing",
    image: "/products/camel.jpg",
    alt: "Camel wool coat",
  },
  {
    kicker: "Metal",
    title: "Jewelry meant to be stacked",
    text: "Chains, cuffs, and hoops are sized to sit together. Clasps lie flat, bands are narrow enough for a second ring, and nothing in the case is plated so thinly that it fades in a month.",
    href: "/catalog?category=jewelery",
    image: "/products/chain.jpg",
    alt: "Fine gold chain",
  },
  {
    kicker: "Desk",
    title: "Screens and sound, kept simple",
    text: "Monitors with a cable channel, headphones with a knob you can find by touch, and a laptop that lasts a writing day. The electronics shelf is short on purpose.",
    href: "/catalog?category=electronics",
    image: "/products/monitor.jpg",
    alt: "Studio monitor on a desk",
  },
] as const;

const NOTES = [
  {
    title: "Fit",
    text: "Shirts and knits are described by weight and where the hem lands, not by a size chart invented for the page. If a coat is unlined, the copy says so.",
  },
  {
    title: "Materials",
    text: "Linen will crease. Oiled cotton will darken at the seams. Gold vermeil is labeled as vermeil. The catalog prefers a plain sentence over a material that sounds rarer than it is.",
  },
  {
    title: "Care",
    text: "Wool coats want a brush and air, not a weekly wash. Pearls stay off perfume. Headphones ship with a second cable because the first one lives in a bag.",
  },
] as const;

const STEPS = [
  { n: "01", title: "Narrow the shelf", text: "Filter by price, brand, and rating. Search waits until you pause, then suggests a match." },
  { n: "02", title: "Watch the total move", text: "Quantity, the ARCA10 code, and the delivery method recalculate the amount before you leave the cart." },
  { n: "03", title: "Keep the receipt here", text: "Checkout checks the card locally. The order, with only the last four digits, stays in this browser’s account." },
] as const;

export default async function HomePage() {
  const products = await getProducts();
  const picks = CATEGORIES.map((category) => products.find((product) => product.category === category.id)).filter((product) => product != null);
  const featured = [...products].sort((a, b) => b.rating.rate - a.rating.rate || b.rating.count - a.rating.count).slice(0, 4);
  const arrivals = [105, 109, 116, 124]
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => product != null);
  const quiet = [...products].filter((product) => product.price <= 90).sort((a, b) => a.price - b.price).slice(0, 4);
  const brands = uniqueBrands(products);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-copper uppercase">The shop</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] sm:text-7xl">
            Things worth
            <span className="mt-1 block italic">choosing slowly.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            Clothes, jewelry, and electronics in one catalog. Filters, search, and the cart update immediately, without reloading the shop.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className={buttonClass()}>Browse the catalog</Link>
            <Link href="#about" className={buttonClass("ghost")}>About the shop</Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">In the catalog</dt>
              <dd className="mt-1 font-display text-3xl">{products.length}</dd>
            </div>
            <div>
              <dt className="text-muted">Categories</dt>
              <dd className="mt-1 font-display text-3xl">{CATEGORIES.length}</dd>
            </div>
            <div>
              <dt className="text-muted">Courier from</dt>
              <dd className="mt-1 font-display text-3xl">${FREE_SHIPPING_FROM}</dd>
            </div>
          </dl>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-6">
          {picks.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-paper-deep">
              <Image src={product.image} alt={product.title} fill sizes="(min-width: 1024px) 240px, 45vw" className="object-contain p-6 transition duration-300 group-hover:scale-105" priority={product.id === picks[0]?.id} />
              <span className="absolute inset-x-3 bottom-3 rounded-full bg-card/90 px-3 py-1 text-xs font-medium backdrop-blur">
                {categoryLabel(product.category)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Categories">
        {CATEGORIES.map((category, index) => {
          const count = products.filter((product) => product.category === category.id).length;
          return (
            <Link key={category.id} href={`/catalog?category=${encodeURIComponent(category.id)}`} className="rounded-2xl border border-line bg-card p-5 transition hover:border-ink/30">
              <p className="text-xs text-muted">0{index + 1}</p>
              <h2 className="mt-3 font-display text-3xl leading-none">{category.label}</h2>
              <p className="mt-2 text-sm text-muted">{category.note}</p>
              <p className="mt-4 text-sm">{count} {plural(count, "item", "items")}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">New on the floor</p>
            <h2 className="mt-2 font-display text-5xl leading-none">Just arrived</h2>
          </div>
          <Link href="/catalog?sort=popular" className="text-sm font-semibold underline">Full catalog</Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-20" aria-label="Journal">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Journal</p>
          <h2 className="mt-2 font-display text-5xl leading-none">Notes from the shelves.</h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {STORIES.map((story) => (
            <article key={story.title} className="overflow-hidden rounded-3xl border border-line bg-card">
              <Link href={story.href} className="relative block aspect-[5/4] bg-paper-deep">
                <Image src={story.image} alt={story.alt} fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover" />
              </Link>
              <div className="p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">{story.kicker}</p>
                <h3 className="mt-2 font-display text-3xl leading-none">{story.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{story.text}</p>
                <Link href={story.href} className="mt-4 inline-block text-sm font-semibold underline">Open the shelf</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-5xl leading-none">Highly rated</h2>
          <Link href="/catalog?sort=rating" className="text-sm font-semibold underline">Sort by rating</Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-20 grid items-center gap-8 rounded-3xl bg-paper-deep px-6 py-10 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Under $90</p>
          <h2 className="mt-3 font-display text-5xl leading-none">The quieter shelf.</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Tees, hoops, earbuds, and the other pieces that do not need a speech. They still pass the same filters as the coats.
          </p>
          <Link href="/catalog?max=90&sort=price-asc" className={`${buttonClass("ghost")} mt-6`}>See everything under $90</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quiet.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="rounded-2xl bg-card p-3">
              <span className="relative block aspect-square overflow-hidden rounded-xl bg-paper">
                <Image src={product.image} alt={product.title} fill sizes="200px" className="object-contain p-3" />
              </span>
              <span className="mt-3 block text-xs tracking-[0.14em] text-muted uppercase">{product.brand}</span>
              <span className="mt-1 block font-display text-2xl leading-none">{product.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.2fr]" aria-label="How an order moves">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">In the shop</p>
          <h2 className="mt-2 font-display text-5xl leading-none">How an order moves.</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            Nothing here is a marketplace listing. The catalog, the cart, and the account are one shop, and the total you see is the total that is saved.
          </p>
        </div>
        <ol className="grid gap-4">
          {STEPS.map((step) => (
            <li key={step.n} className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-line bg-card p-5">
              <span className="font-display text-3xl text-copper">{step.n}</span>
              <span>
                <span className="block font-display text-3xl leading-none">{step.title}</span>
                <span className="mt-2 block text-sm leading-6 text-muted">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20" aria-label="Studio notes">
        <h2 className="font-display text-5xl leading-none">Before you add it.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {NOTES.map((note) => (
            <article key={note.title} className="rounded-2xl border border-line p-6">
              <h3 className="font-display text-3xl leading-none">{note.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{note.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="mt-20 grid gap-8 rounded-3xl bg-forest px-6 py-10 text-paper sm:px-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-paper/70 uppercase">About the shop</p>
          <h2 className="mt-3 font-display text-5xl leading-none">From a backpack to a monitor.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-paper/80">
            ARCA puts different shelves on one page: narrow the price, keep a favorite brand, and hide anything below the rating you want. Promo code {PROMO_CODE} takes 10% off on the cart page.
          </p>
        </div>
        <div className="grid content-end gap-3 text-sm">
          <p className="border-t border-paper/20 pt-3">Search waits for a pause in typing, then suggests items from the catalog.</p>
          <p className="border-t border-paper/20 pt-3">The cart recalculates the total, the discount, and shipping on every change.</p>
          <p className="border-t border-paper/20 pt-3">Order history stays in this browser’s account.</p>
        </div>
      </section>

      <section className="mt-20" aria-label="Houses">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Houses</p>
            <h2 className="mt-2 font-display text-5xl leading-none">Names on the labels.</h2>
          </div>
          <p className="max-w-xs text-sm text-muted">{brands.length} brands, from the original shelf and the new floor.</p>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {brands.map((brand) => (
            <li key={brand}>
              <Link href={`/catalog?brand=${encodeURIComponent(brand)}`} className="inline-block rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-ink">
                {brand}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 grid gap-6 border-t border-line pt-10 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Showroom</p>
          <p className="mt-3 font-display text-3xl leading-none">Open Thursday to Saturday.</p>
          <p className="mt-3 text-sm leading-6 text-muted">Pickup is from the showroom. Courier is free from ${FREE_SHIPPING_FROM}, otherwise it is a flat fee you can see before you pay.</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">A code, if you want one</p>
          <p className="mt-3 font-display text-3xl leading-none">{PROMO_CODE}</p>
          <p className="mt-3 text-sm leading-6 text-muted">Ten percent off the goods. Shipping is calculated after the discount, so a coat near the free-courier line can still clear it.</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Payment</p>
          <p className="mt-3 font-display text-3xl leading-none">A demo card only.</p>
          <p className="mt-3 text-sm leading-6 text-muted">4242 4242 4242 4242, any future expiry, any CVV. The full number never leaves this browser.</p>
        </div>
      </section>
    </div>
  );
}
