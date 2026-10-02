import type { Metadata } from "next";
import { OrderScreen } from "@/components/account-screen";

export const metadata: Metadata = { title: "Order placed" };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <OrderScreen id={id ?? ""} placed />;
}
