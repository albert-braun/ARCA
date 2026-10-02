import type { Metadata } from "next";
import { CartScreen } from "@/components/cart-screen";

export const metadata: Metadata = { title: "Cart", description: "Order contents, a promo code, and a live shipping total." };

export default function CartPage() {
  return <CartScreen />;
}
