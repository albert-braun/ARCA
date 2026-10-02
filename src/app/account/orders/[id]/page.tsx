import type { Metadata } from "next";
import { OrderScreen } from "@/components/account-screen";

export const metadata: Metadata = { title: "Order" };

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderScreen id={decodeURIComponent(id)} />;
}
