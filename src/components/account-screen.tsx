"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, buttonClass } from "@/components/button";
import { Field, TextInput } from "@/components/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatDate, formatMoney, initials, plural } from "@/lib/format";
import { loginSchema, profileSchema, registerSchema, type LoginValues, type ProfileValues, type RegisterValues } from "@/lib/validators";
import type { OrderStatus } from "@/lib/types";
import { useAccountStore } from "@/store/account-store";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";

const statusLabel: Record<OrderStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export function AccountScreen() {
  const hydrated = useHydrated();
  const user = useAccountStore((state) => state.user);
  if (!hydrated) return <p className="mx-auto max-w-[1200px] px-4 py-16 text-muted sm:px-6">Opening your account…</p>;
  if (!user) return <AuthGate />;
  return <Dashboard />;
}

function AuthGate() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Account</p>
      <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Sign in to ARCA</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        The account lives only in this browser. Orders placed with the same email appear in the history after you sign in.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LoginCard />
        <RegisterCard />
      </div>
    </div>
  );
}

function LoginCard() {
  const login = useAccountStore((state) => state.login);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  return (
    <form
      noValidate
      className="rounded-2xl border border-line bg-card p-5"
      onSubmit={form.handleSubmit(async (values) => {
        const ok = await login(values.email, values.password);
        if (!ok) form.setError("root", { message: "Wrong email or password" });
      })}
    >
      <h2 className="font-display text-3xl">I already have an account</h2>
      <div className="mt-4 space-y-4">
        <Field label="Email" error={form.formState.errors.email?.message}>
          <TextInput type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <TextInput type="password" autoComplete="current-password" error={form.formState.errors.password?.message} {...form.register("password")} />
        </Field>
        {form.formState.errors.root ? <p className="text-sm text-danger">{form.formState.errors.root.message}</p> : null}
        <Button type="submit">Sign in</Button>
      </div>
    </form>
  );
}

function RegisterCard() {
  const registerUser = useAccountStore((state) => state.register);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  return (
    <form
      noValidate
      className="rounded-2xl border border-line bg-card p-5"
      onSubmit={form.handleSubmit(async (values) => {
        const result = await registerUser(values);
        if (result === "exists") form.setError("email", { message: "This email is already registered" });
      })}
    >
      <h2 className="font-display text-3xl">Create an account</h2>
      <div className="mt-4 space-y-4">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <TextInput autoComplete="name" error={form.formState.errors.name?.message} {...form.register("name")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <TextInput type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <TextInput type="password" autoComplete="new-password" error={form.formState.errors.password?.message} {...form.register("password")} />
        </Field>
        <Field label="Password again" error={form.formState.errors.confirm?.message}>
          <TextInput type="password" autoComplete="new-password" error={form.formState.errors.confirm?.message} {...form.register("confirm")} />
        </Field>
        <Button type="submit">Register</Button>
      </div>
    </form>
  );
}

function Dashboard() {
  const user = useAccountStore((state) => state.user);
  const orders = useAccountStore((state) => state.orders);
  const logout = useAccountStore((state) => state.logout);
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  if (!user) return null;
  const mine = orders.filter((order) => order.email.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-forest font-display text-2xl text-paper">{initials(user.name)}</span>
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Account</p>
            <h1 className="font-display text-5xl leading-none">{user.name}</h1>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={logout}>Sign out</Button>
      </div>
      <div className="mt-8 flex gap-2">
        {([
          ["orders", "Orders"],
          ["profile", "Profile"],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? "bg-ink text-paper" : "bg-card"}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "orders" ? (
        <div className="mt-6 space-y-3">
          {mine.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
              <p className="font-display text-4xl">No orders yet</p>
              <p className="mt-2 text-sm text-muted">Place an order and it will show up here.</p>
              <Link href="/catalog" className={`${buttonClass()} mt-5`}>Browse the catalog</Link>
            </div>
          ) : (
            mine.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4">
                <span>
                  <span className="block font-medium">{order.id}</span>
                  <span className="text-sm text-muted">{formatDate(order.createdAt)}</span>
                </span>
                <span className="text-sm text-muted">
                  {order.items.reduce((sum, item) => sum + item.qty, 0)} {plural(order.items.reduce((sum, item) => sum + item.qty, 0), "item", "items")}
                </span>
                <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-medium">{statusLabel[order.status]}</span>
                <span className="font-medium tabular-nums">{formatMoney(order.total)}</span>
              </Link>
            ))
          )}
        </div>
      ) : (
        <ProfileForm />
      )}
    </div>
  );
}

function ProfileForm() {
  const user = useAccountStore((state) => state.user);
  const updateProfile = useAccountStore((state) => state.updateProfile);
  const [saved, setSaved] = useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: user
      ? { name: user.name, phone: user.phone, city: user.city, street: user.street, apartment: user.apartment, postal: user.postal }
      : undefined,
  });

  if (!user) return null;

  return (
    <form
      noValidate
      className="mt-6 max-w-xl space-y-4 rounded-2xl border border-line bg-card p-5"
      onSubmit={form.handleSubmit((values) => {
        updateProfile(values);
        setSaved(true);
      })}
    >
      <h2 className="font-display text-3xl">Profile</h2>
      <p className="text-sm text-muted">These details fill the next order. Email stays the same: {user.email}</p>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <TextInput error={form.formState.errors.name?.message} {...form.register("name")} />
      </Field>
      <Field label="Phone" error={form.formState.errors.phone?.message}>
        <TextInput type="tel" error={form.formState.errors.phone?.message} {...form.register("phone")} />
      </Field>
      <Field label="City" error={form.formState.errors.city?.message}>
        <TextInput error={form.formState.errors.city?.message} {...form.register("city")} />
      </Field>
      <Field label="Street and number" error={form.formState.errors.street?.message}>
        <TextInput error={form.formState.errors.street?.message} {...form.register("street")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Apartment" error={form.formState.errors.apartment?.message}>
          <TextInput error={form.formState.errors.apartment?.message} {...form.register("apartment")} />
        </Field>
        <Field label="Postal code" error={form.formState.errors.postal?.message}>
          <TextInput error={form.formState.errors.postal?.message} {...form.register("postal")} />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        {saved ? <p className="text-sm text-moss">Saved</p> : null}
      </div>
    </form>
  );
}

export function OrderScreen({ id, placed = false }: { id: string; placed?: boolean }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const order = useAccountStore((state) => state.orders.find((entry) => entry.id === id) ?? null);
  const user = useAccountStore((state) => state.user);
  const add = useCartStore((state) => state.add);

  if (!hydrated) return <p className="mx-auto max-w-3xl px-4 py-16 text-muted">Looking up the order…</p>;
  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-5xl">Order not found</h1>
        <p className="mt-3 text-sm text-muted">This browser has no order {id}.</p>
        <Link href="/account" className={`${buttonClass()} mt-6`}>Back to account</Link>
      </div>
    );
  }
  if (user && user.email.toLowerCase() !== order.email.toLowerCase()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-5xl">This order belongs to someone else</h1>
        <p className="mt-3 text-sm text-muted">It was placed with a different email. Sign in with the address you used at checkout.</p>
      </div>
    );
  }

  const delivery = { pickup: "Pickup", courier: "Courier", express: "Express" }[order.delivery];
  const payment = order.payment === "card" ? `Card •• ${order.cardLast4 ?? "••••"}` : "Pay on delivery";

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">{statusLabel[order.status]}</p>
      <h1 className="mt-2 font-display text-4xl leading-none break-words sm:text-5xl">Order {order.id}</h1>
      {placed ? <p className="mt-4 rounded-2xl bg-forest/10 px-4 py-3 text-sm">The order is saved in this browser. Nothing was charged.</p> : null}
      <p className="mt-3 text-sm text-muted">{formatDate(order.createdAt)} · {order.customerName}</p>
      <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-card p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Delivery</dt>
          <dd className="mt-1">{delivery}</dd>
          <dd>{order.address.city}, {order.address.street}{order.address.apartment ? `, ${order.address.apartment}` : ""}</dd>
          <dd>{order.address.postal}</dd>
        </div>
        <div>
          <dt className="text-muted">Payment</dt>
          <dd className="mt-1">{payment}</dd>
          <dd>{order.email}</dd>
          <dd>{order.phone}</dd>
        </div>
        {order.comment ? (
          <div className="sm:col-span-2">
            <dt className="text-muted">Comment</dt>
            <dd className="mt-1">{order.comment}</dd>
          </div>
        ) : null}
      </dl>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
            <span className="min-w-0">
              <Link href={`/product/${item.productId}`} className="font-medium hover:underline">{item.title}</Link>
              <span className="mt-1 block text-muted">{item.brand} · {item.qty} × {formatMoney(item.price)}</span>
            </span>
            <span className="tabular-nums">{formatMoney(item.price * item.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Items</dt><dd className="tabular-nums">{formatMoney(order.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="tabular-nums">{order.discount ? `−${formatMoney(order.discount)}` : formatMoney(0)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="tabular-nums">{order.shipping ? formatMoney(order.shipping) : "Free"}</dd></div>
        <div className="flex justify-between pt-2 text-base"><dt>Total</dt><dd className="font-display text-3xl tabular-nums">{formatMoney(order.total)}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={() => {
            order.items.forEach((item) =>
              add(
                { productId: item.productId, title: item.title, brand: item.brand, price: item.price, image: item.image },
                item.qty,
              ),
            );
            router.push("/cart");
          }}
        >
          Repeat order
        </Button>
        <Link href="/account" className={buttonClass("ghost")}>All orders</Link>
      </div>
    </article>
  );
}
