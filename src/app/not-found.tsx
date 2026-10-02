import Link from "next/link";
import { buttonClass } from "@/components/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">404</p>
      <h1 className="mt-3 font-display text-6xl">This page is not here</h1>
      <p className="mt-3 text-sm text-muted">The product may have left the catalog, or the address has a typo.</p>
      <Link href="/catalog" className={`${buttonClass()} mt-8`}>
        Go to the catalog
      </Link>
    </div>
  );
}
