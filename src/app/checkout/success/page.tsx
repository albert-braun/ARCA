import type { Metadata } from "next";
import { OrderRoute } from "@/components/order-route";

export const metadata: Metadata = { title: "Order placed" };

export default function SuccessPage() {
  return <OrderRoute placed />;
}
