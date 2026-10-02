"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, buttonClass } from "@/components/button";
import { Field, TextArea, TextInput } from "@/components/field";
import { OrderSummary } from "@/components/order-summary";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatMoney, plural } from "@/lib/format";
import { COURIER_FEE, EXPRESS_FEE, FREE_SHIPPING_FROM, discountFor, roundMoney, shippingCost } from "@/lib/pricing";
import type { DeliveryMethod } from "@/lib/types";
import { checkoutSchema, onlyDigits, type CheckoutValues } from "@/lib/validators";
import { useAccountStore } from "@/store/account-store";
import { selectCount, selectSubtotal, useCartStore } from "@/store/cart-store";

const deliveryOptions: { id: DeliveryMethod; title: string; text: string }[] = [
  { id: "pickup", title: "Pickup", text: "From the showroom" },
  { id: "courier", title: "Courier", text: `Free from $${FREE_SHIPPING_FROM}, otherwise $${COURIER_FEE}` },
  { id: "express", title: "Express", text: `Priority shipping, $${EXPRESS_FEE}` },
];

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const user = useAccountStore((state) => state.user);
  const placeOrder = useAccountStore((state) => state.placeOrder);
  const [pending, setPending] = useState(false);
  const prefilled = useRef(false);
  const submitted = useRef(false);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      street: "",
      apartment: "",
      postal: "",
      delivery: "courier",
      payment: "card",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      comment: "",
      consent: false,
    },
  });

  const { setValue, getValues, register, handleSubmit, watch, formState } = form;
  const delivery = watch("delivery");
  const payment = watch("payment");
  const errors = formState.errors;

  useEffect(() => {
    if (!hydrated || !user || prefilled.current) return;
    prefilled.current = true;
    const [first, ...rest] = user.name.split(" ").filter(Boolean);
    const current = getValues();
    if (!current.firstName && first) setValue("firstName", first);
    if (!current.lastName && rest.length) setValue("lastName", rest.join(" "));
    if (!current.email) setValue("email", user.email);
    if (!current.phone && user.phone) setValue("phone", user.phone);
    if (!current.city && user.city) setValue("city", user.city);
    if (!current.street && user.street) setValue("street", user.street);
    if (!current.apartment && user.apartment) setValue("apartment", user.apartment);
    if (!current.postal && user.postal) setValue("postal", user.postal);
  }, [getValues, hydrated, setValue, user]);

  useEffect(() => {
    if (hydrated && items.length === 0 && !submitted.current) router.replace("/cart");
  }, [hydrated, items.length, router]);

  if (!hydrated) {
    return <p className="mx-auto max-w-[1200px] px-4 py-16 text-muted sm:px-6">Preparing your order…</p>;
  }

  if (items.length === 0) return null;

  const subtotal = selectSubtotal(items);

  function onSubmit(values: CheckoutValues) {
    const snapshot = useCartStore.getState();
    if (snapshot.items.length === 0 || pending) return;
    submitted.current = true;
    setPending(true);
    const currentSubtotal = selectSubtotal(snapshot.items);
    const discount = discountFor(currentSubtotal, snapshot.promo);
    const shipping = shippingCost(currentSubtotal, values.delivery);
    const order = placeOrder({
      email: values.email.trim(),
      customerName: `${values.firstName.trim()} ${values.lastName.trim()}`,
      phone: values.phone.trim(),
      items: snapshot.items,
      delivery: values.delivery,
      payment: values.payment,
      cardLast4: values.payment === "card" ? onlyDigits(values.cardNumber).slice(-4) : undefined,
      address: {
        city: values.city.trim(),
        street: values.street.trim(),
        apartment: values.apartment.trim(),
        postal: values.postal.trim(),
      },
      comment: values.comment.trim(),
      subtotal: roundMoney(currentSubtotal),
      discount,
      shipping,
      total: roundMoney(Math.max(0, currentSubtotal - discount + shipping)),
      promo: discount > 0 ? snapshot.promo : "",
    });
    clear();
    router.push(`/checkout/success?id=${order.id}`);
  }

  return (
    <form noValidate className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-copper uppercase">Order</p>
          <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Checkout</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {selectCount(items)} {plural(selectCount(items), "item", "items")} for {formatMoney(subtotal)}. The card is checked locally, and the full number is not stored.
          </p>
        </div>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-3xl">Contacts</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="First name" error={errors.firstName?.message}>
              <TextInput autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <TextInput autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <TextInput type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <TextInput type="tel" autoComplete="tel" placeholder="+1 202 555 0147" error={errors.phone?.message} {...register("phone")} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-3xl">Address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="City" error={errors.city?.message}>
              <TextInput autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            </Field>
            <Field label="Postal code" error={errors.postal?.message}>
              <TextInput autoComplete="postal-code" error={errors.postal?.message} {...register("postal")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Street and number" error={errors.street?.message}>
                <TextInput autoComplete="street-address" error={errors.street?.message} {...register("street")} />
              </Field>
            </div>
            <Field label="Apartment" error={errors.apartment?.message}>
              <TextInput autoComplete="address-line2" error={errors.apartment?.message} {...register("apartment")} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-3xl">Delivery</h2>
          <div className="mt-4 grid gap-3">
            {deliveryOptions.map((option) => {
              const price = shippingCost(subtotal, option.id);
              return (
                <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${delivery === option.id ? "border-forest bg-forest/5" : "border-line"}`}>
                  <input type="radio" value={option.id} className="mt-1 accent-forest" {...register("delivery")} />
                  <span className="flex-1">
                    <span className="block font-medium">{option.title}</span>
                    <span className="mt-1 block text-sm text-muted">{option.text}</span>
                  </span>
                  <span className="text-sm tabular-nums">{price === 0 ? "Free" : formatMoney(price)}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-3xl">Payment</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {([
              ["card", "Card"],
              ["cash", "Pay on delivery"],
            ] as const).map(([value, label]) => (
              <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${payment === value ? "border-forest bg-forest/5" : "border-line"}`}>
                <input type="radio" value={value} className="accent-forest" {...register("payment")} />
                {label}
              </label>
            ))}
          </div>
          {payment === "card" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Name on card" error={errors.cardName?.message}>
                  <TextInput autoComplete="cc-name" error={errors.cardName?.message} {...register("cardName")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Card number" error={errors.cardNumber?.message} hint="Test number 4242 4242 4242 4242. It is not sent to a server.">
                  <TextInput
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    error={errors.cardNumber?.message}
                    {...register("cardNumber")}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
                      setValue("cardNumber", digits.replace(/(\d{4})(?=\d)/g, "$1 "), { shouldValidate: formState.isSubmitted || !!errors.cardNumber });
                    }}
                  />
                </Field>
              </div>
              <Field label="Expiry" error={errors.expiry?.message}>
                <TextInput
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="12/28"
                  error={errors.expiry?.message}
                  {...register("expiry")}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                    const next = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                    setValue("expiry", next, { shouldValidate: formState.isSubmitted || !!errors.expiry });
                  }}
                />
              </Field>
              <Field label="CVV" error={errors.cvv?.message}>
                <TextInput
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  error={errors.cvv?.message}
                  {...register("cvv")}
                  onChange={(event) => setValue("cvv", event.target.value.replace(/\D/g, "").slice(0, 4), { shouldValidate: formState.isSubmitted || !!errors.cvv })}
                />
              </Field>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Pay the courier or at pickup. Nothing is charged now.</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <Field label="Order comment" error={errors.comment?.message}>
            <TextArea rows={4} maxLength={400} error={errors.comment?.message} {...register("comment")} />
          </Field>
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 accent-forest" {...register("consent")} />
            <span>I agree to use my details for this demo order. Nothing is charged.</span>
          </label>
          {errors.consent ? <p className="mt-2 text-sm text-danger">{errors.consent.message}</p> : null}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ul className="space-y-3 rounded-2xl border border-line bg-card p-4">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3 text-sm">
              <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-paper-deep">
                <Image src={item.image} alt="" fill sizes="48px" className="object-contain p-1" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2">{item.title}</span>
                <span className="text-muted"> × {item.qty}</span>
              </span>
              <span className="tabular-nums">{formatMoney(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary delivery={delivery} />
        {formState.submitCount > 0 && Object.keys(errors).length > 0 ? (
          <p className="text-sm text-danger">Check the fields — the order cannot be placed yet.</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Placing order…" : "Place order"}
        </Button>
        <Link href="/cart" className={`${buttonClass("ghost")} w-full`}>
          Back to cart
        </Link>
      </aside>
    </form>
  );
}
