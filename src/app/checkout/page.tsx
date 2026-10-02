import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Address, delivery, and a card check before the order is saved.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
