import type { Metadata } from "next";
import { AccountScreen } from "@/components/account-screen";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in, profile, and order history.",
};

export default function AccountPage() {
  return <AccountScreen />;
}
