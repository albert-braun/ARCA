import { z } from "zod";

const personName = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 letters`)
    .regex(/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]*$/, `${label} can contain only letters`);

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string) {
  if (!/^[+\d][\d\s()-]{8,}$/.test(value.trim())) return false;
  const digits = onlyDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidLuhn(value: string) {
  const digits = onlyDigits(value);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let current = Number(digits[index]);
    if (alternate) {
      current *= 2;
      if (current > 9) current -= 9;
    }
    sum += current;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 1) > new Date();
}

const postal = /^[A-Za-z0-9][A-Za-z0-9 -]{3,9}$/;

export const checkoutSchema = z
  .object({
    firstName: personName("First name"),
    lastName: personName("Last name"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().refine(isValidPhone, "Phone needs 10–15 digits, for example +1 202 555 0147"),
    city: z.string().trim().min(2, "Enter a city"),
    street: z.string().trim().min(5, "Enter a street and building number"),
    apartment: z.string().trim().max(20, "Apartment is too long"),
    postal: z.string().trim().regex(postal, "Postal code must be 4–10 characters"),
    delivery: z.enum(["pickup", "courier", "express"]),
    payment: z.enum(["card", "cash"]),
    cardName: z.string().trim(),
    cardNumber: z.string().trim(),
    expiry: z.string().trim(),
    cvv: z.string().trim(),
    comment: z.string().trim().max(400, "Comment must be 400 characters or fewer"),
    consent: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.consent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consent"],
        message: "Consent is required",
      });
    }
    if (data.payment !== "card") return;
    if (data.cardName.trim().length < 3 || !/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(data.cardName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardName"],
        message: "Name on card must be letters only",
      });
    }
    if (!isValidLuhn(data.cardNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardNumber"],
        message: "Card number failed the check",
      });
    }
    if (!isValidExpiry(data.expiry)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiry"],
        message: "Use MM/YY and a date that has not expired",
      });
    }
    if (!/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cvv"],
        message: "CVV must be 3 or 4 digits",
      });
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: personName("Name"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: personName("Name"),
  phone: z.string().trim().refine((value) => value === "" || isValidPhone(value), "Phone needs 10–15 digits"),
  city: z.string().trim().max(60, "City name is too long"),
  street: z.string().trim().max(120, "Street is too long"),
  apartment: z.string().trim().max(20, "Apartment is too long"),
  postal: z.string().trim().refine((value) => value === "" || postal.test(value), "Postal code must be 4–10 characters"),
});

export type ProfileValues = z.infer<typeof profileSchema>;
