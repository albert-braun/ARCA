export type Rating = {
  rate: number;
  count: number;
};

export type RawProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
};

export type Product = RawProduct & {
  brand: string;
};

export type CartItem = {
  productId: number;
  title: string;
  brand: string;
  price: number;
  image: string;
  qty: number;
};

export type DeliveryMethod = "pickup" | "courier" | "express";
export type PaymentMethod = "card" | "cash";
export type OrderStatus = "processing" | "shipped" | "delivered";

export type Order = {
  id: string;
  createdAt: string;
  email: string;
  customerName: string;
  phone: string;
  items: CartItem[];
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  cardLast4?: string;
  address: {
    city: string;
    street: string;
    apartment: string;
    postal: string;
  };
  comment: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promo: string;
  status: OrderStatus;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  apartment: string;
  postal: string;
};

export type StoredUser = Profile & {
  passwordHash: string;
};
