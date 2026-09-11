import { Suspense } from "react";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { LoadingSpinner } from "./dashboard/loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    const locale = await getLocale();
    return redirect({ href: "/sign-in", locale });
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar user={{ role: session.user.role, plan: session.user.plan }} />
      <SidebarInset>
        <Header user={session.user} />
          <main className="flex flex-1 flex-col px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8">
            {children}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
