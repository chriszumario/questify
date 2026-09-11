"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon } from "lucide-react";
import { usePathname, useRouter, Link } from "@/i18n/routing";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Settings, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

const breadcrumbKeys = {
  dashboard: "breadcrumbs.dashboard",
  activity: "breadcrumbs.activity",
  quizzes: "breadcrumbs.quizzes",
  polls: "breadcrumbs.polls",
  ai: "breadcrumbs.ai",
  settings: "breadcrumbs.settings",
  admin: "breadcrumbs.admin",
  analytics: "breadcrumbs.analytics",
  users: "breadcrumbs.users",
  billing: "breadcrumbs.billing",
  profile: "breadcrumbs.profile",
  security: "breadcrumbs.security",
  create: "breadcrumbs.create",
  results: "breadcrumbs.results",
} as const;

interface HeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    plan: string;
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations('Header');

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  // Create breadcrumbs based on pathname
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4 backdrop-blur-xl md:h-14">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              let title = segment.charAt(0).toUpperCase() + segment.slice(1);

              // Truncate UUIDs to make breadcrumbs prettier
              if (segment.length > 20 && segment.includes("-")) {
                title = segment.slice(0, 8) + "...";
              } else if (segment in breadcrumbKeys) {
                title = t(breadcrumbKeys[segment as keyof typeof breadcrumbKeys]);
              }

              const href = "/" + segments.slice(0, index + 1).join("/");

              return (
                <React.Fragment key={segment}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link href={href} />} className="text-muted-foreground transition-colors hover:text-foreground">
                        {title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">


        {/* Language Switcher */}
        <LanguageSwitcher />

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('toggleTheme')}</span>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full ml-1 flex items-center justify-center outline-none ring-primary focus-visible:ring-2 hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8 border border-border/50">
              <AvatarImage src={user.image || undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name.charAt(0) || <UserIcon className="size-4"/>}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{user.name || t('user')}</p>
                    {user.plan === "pro" && (
                      <span className="px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('accountSettings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
