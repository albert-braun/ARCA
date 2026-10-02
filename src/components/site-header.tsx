"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconCart, IconClose, IconMenu, IconSearch, IconUser } from "@/components/icons";
import { SearchBox } from "@/components/search-box";
import { useHydrated } from "@/hooks/use-hydrated";
import { plural } from "@/lib/format";
import { selectCount, useCartStore } from "@/store/cart-store";

const links = [
  { href: "/catalog", label: "Catalog" },
  { href: "/account", label: "Account" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useCartStore((state) => selectCount(state.items));
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const shown = hydrated ? count : 0;

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="font-display text-4xl leading-none italic tracking-tight">
          ARCA
        </Link>
        <div className="ml-4 hidden min-w-0 flex-1 md:block">
          <SearchBox />
        </div>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={`rounded-full px-3 py-2 text-sm ${active ? "bg-ink text-paper" : "hover:bg-paper-deep"}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-deep md:hidden" aria-label="Open search" onClick={() => setSearchOpen((value) => !value)}>
            <IconSearch />
          </button>
          <Link href="/account" className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-deep md:hidden" aria-label="Account">
            <IconUser />
          </Link>
          <button type="button" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-paper-deep" aria-label={shown ? `Cart, ${shown} ${plural(shown, "item", "items")}` : "Cart"} onClick={openDrawer}>
            <IconCart />
            {shown > 0 ? (
              <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-copper px-1 text-[10px] font-bold text-paper">
                {shown}
              </span>
            ) : null}
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-deep md:hidden" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      {searchOpen ? (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
        </div>
      ) : null}
      {menuOpen ? (
        <nav className="grid gap-1 border-t border-line px-4 py-3 md:hidden" aria-label="Mobile menu">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl px-3 py-3 hover:bg-paper-deep">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="rounded-xl px-3 py-3 hover:bg-paper-deep">
            Cart
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
