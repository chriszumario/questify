import { redirect } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";
import { getLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return redirect({ href: "/dashboard", locale: await getLocale() });
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-7xl mx-auto w-full p-4 lg:p-8">
      {children}
    </div>
  );
}
