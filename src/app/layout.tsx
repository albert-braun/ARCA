import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CartDrawer } from "@/components/cart-drawer";
import { CatalogData } from "@/components/catalog-data";
import { NoticeBar } from "@/components/notice-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProducts } from "@/lib/products";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ARCA — a shop of chosen things",
    template: "%s — ARCA",
  },
  description: "A catalog with price, brand, and rating filters, debounced search, a cart, and an order history.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ARCA",
    title: "ARCA — a shop of chosen things",
    description: "Clothes, jewelry, and electronics on one shelf.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3efe6",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const products = await getProducts();
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        <CatalogData products={products}>
          <a href="#main" className="skip-link">Skip to content</a>
          <SiteHeader />
          <main id="main" className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <NoticeBar />
        </CatalogData>
      </body>
    </html>
  );
}
