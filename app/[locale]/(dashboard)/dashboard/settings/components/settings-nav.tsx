"use client";

import { Link, usePathname } from "@/i18n/routing";
import { User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const settingsRoutes = [
  { key: "profile", href: "/dashboard/settings", icon: User },
  { key: "security", href: "/dashboard/settings/security", icon: Lock },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const t = useTranslations("UserSettings.nav");

  return (
    <nav
      aria-label={t("label")}
      className="grid h-8 w-full grid-cols-2 items-center rounded-lg bg-muted p-[3px] text-muted-foreground"
    >
      {settingsRoutes.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.key === "profile" &&
            pathname === "/dashboard/settings/profile");
        return (
          <Link
            key={item.href}
            href={item.href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-full items-center justify-center gap-1.5 rounded-md border border-transparent px-3 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden="true" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
