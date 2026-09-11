import { SecurityForm } from "./security-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata = {
  title: "Security Settings",
};

export default async function SecuritySettingsPage() {
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  return (
    <SecurityForm
      isOAuthOnly={accounts.every(
        (account) => account.providerId !== "credential",
      )}
    />
  );
}
