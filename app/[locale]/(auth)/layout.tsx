import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session?.user) {
    const locale = await getLocale();
    return redirect({ href: "/dashboard", locale });
  }

  return children;
}
