"use client";

import { useEffect, useState } from "react";
import { OrderScreen } from "@/components/account-screen";

export function OrderRoute({ placed = false }: { placed?: boolean }) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id") ?? "");
  }, []);

  if (id === null) return <p className="mx-auto max-w-3xl px-4 py-16 text-muted">Looking up the order…</p>;
  return <OrderScreen id={id} placed={placed} />;
}
