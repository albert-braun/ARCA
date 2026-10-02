"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export function NoticeBar() {
  const notice = useCartStore((state) => state.notice);
  const setNotice = useCartStore((state) => state.setNotice);
  const openDrawer = useCartStore((state) => state.openDrawer);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timer);
  }, [notice, setNotice]);

  if (!notice) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-paper shadow-lg">
      <span>{notice.text}</span>
      <button
        type="button"
        className="font-semibold underline"
        onClick={() => {
          setNotice(null);
          openDrawer();
        }}
      >
        Open
      </button>
    </div>
  );
}
