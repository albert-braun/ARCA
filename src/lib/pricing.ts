import type { DeliveryMethod } from "@/lib/types";

export const PROMO_CODE = "ARCA10";
export const FREE_SHIPPING_FROM = 150;
export const COURIER_FEE = 12;
export const EXPRESS_FEE = 24;

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function discountFor(subtotal: number, promo: string) {
  if (promo.trim().toUpperCase() !== PROMO_CODE) return 0;
  return roundMoney(subtotal * 0.1);
}

export function shippingCost(subtotal: number, method: DeliveryMethod) {
  if (method === "pickup") return 0;
  if (method === "express") return EXPRESS_FEE;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : COURIER_FEE;
}

export function quote(subtotal: number, promo: string, method: DeliveryMethod) {
  const discount = discountFor(subtotal, promo);
  const shipping = shippingCost(subtotal, method);
  const total = roundMoney(Math.max(0, subtotal - discount + shipping));
  return { subtotal: roundMoney(subtotal), discount, shipping, total };
}
