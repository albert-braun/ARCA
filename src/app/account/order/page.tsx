import type { Metadata } from "next";
import { OrderRoute } from "@/components/order-route";

export const metadata: Metadata = { title: "Order" };

export default function AccountOrderPage() {
  return <OrderRoute />;
}
