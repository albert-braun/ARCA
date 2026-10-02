# ARCA

A storefront for a portfolio: catalog, search, cart, checkout, and an account with order history.

## Stack

- Next.js (App Router, SSR, and metadata for SEO)
- Tailwind CSS
- Zustand — cart, promo code, account, and order history
- React Hook Form + Zod — the checkout form
- [FakeStoreAPI](https://fakestoreapi.com) as the product source, with a local fallback catalog in `src/data/products.json`

FakeStoreAPI has no brand field. Brands taken from titles, plus a short id map, live in `src/lib/products.ts` so the brand filter is real.

## Run

```bash
npm install
npm run dev
```

The site opens at [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run lint
```

## What to demo

1. **Catalog** — price, brand, rating, category, and sort. Catalog search waits 350 ms. The address bar updates, so the link can be shared.
2. **Header search** — suggestions after the same pause. Arrow keys and Enter open a product.
3. **Cart** — quantity immediately changes the line total, the discount, and shipping. Promo code `ARCA10` is 10% off. Courier is free from $150.
4. **Checkout** — name, phone, address, delivery, and card. The number is checked with the Luhn algorithm, and the expiry cannot be in the past. Test card `4242 4242 4242 4242`, expiry `12/28`, CVV `123`. Only the last 4 digits are stored.
5. **Account** — register and sign in in this browser. History shows orders with the same email, including ones placed before sign-in.

Payment is a demo: card details are never sent to a server.
