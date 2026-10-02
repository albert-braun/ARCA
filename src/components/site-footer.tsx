import Link from "next/link";
import { PROMO_CODE } from "@/lib/pricing";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl italic">ARCA</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            A shop of clothes, jewelry, and electronics. Orders stay in this browser. Payment is a demo and is never sent anywhere.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:underline">Catalog</Link></li>
            <li><Link href="/cart" className="hover:underline">Cart</Link></li>
            <li><Link href="/account" className="hover:underline">Account</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">For customers</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Free courier from $150</li>
            <li>Promo code {PROMO_CODE} — 10% off</li>
            <li>Test card 4242 4242 4242 4242</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-[1200px] px-4 py-4 text-xs text-muted sm:px-6">© {new Date().getFullYear()} ARCA</p>
      </div>
    </footer>
  );
}
