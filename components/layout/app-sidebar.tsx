"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Settings, 
  CheckSquare, 
  FileQuestion,
  LineChart,
  Sparkles,
  Users,
  Target
} from "lucide-react";
import { usePathname, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";


// Fix: prefer-module-scope-static-value — navGroups and adminGroup are static, move outside component
const navGroups = [
  {
    label: "groups.platform",
    items: [
      { title: "items.overview", url: "/dashboard", icon: LayoutDashboard },
      { title: "items.myActivity", url: "/dashboard/activity", icon: Target },
    ]
  },
  {
    label: "groups.contentStudio",
    items: [
      { title: "items.myQuizzes", url: "/dashboard/quizzes", icon: FileQuestion },
      { title: "items.myPolls", url: "/dashboard/polls", icon: CheckSquare },
      { title: "items.aiGeneration", url: "/dashboard/ai", icon: Sparkles },
    ]
  },
  {
    label: "groups.settings",
    items: [
      { title: "items.configuration", url: "/dashboard/settings", icon: Settings },
    ]
  }
] as const;

const adminGroup = {
  label: "groups.adminPanel",
  items: [
    { title: "items.analytics", url: "/dashboard/admin/analytics", icon: LineChart },
    { title: "items.userManagement", url: "/dashboard/admin/users", icon: Users },
    { title: "items.platformSettings", url: "/dashboard/admin/settings", icon: Settings },
  ]
} as const;

interface AppSidebarProps {
  user: { role: string; plan: string };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('Sidebar');

  const isAdmin = user.role === "admin";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pt-4">
        <Link href="/" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center overflow-hidden">
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4 shrink-0" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold tracking-tight text-base">
              Questify
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              {t(group.label)}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1 mt-1">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={pathname === item.url || pathname.startsWith(item.url + '/')} 
                    render={<Link href={item.url} />}
                    className="text-muted-foreground hover:text-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10 data-[active=true]:font-medium transition-all"
                    tooltip={t(item.title)}
                  >
                    <item.icon className="opacity-70 group-data-[active=true]:opacity-100" />
                    <span>{t(item.title)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-medium text-destructive uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              {t(adminGroup.label)}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1 mt-1">
              {adminGroup.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={pathname === item.url || pathname.startsWith(item.url + '/')} 
                    render={<Link href={item.url} />}
                    className="text-muted-foreground hover:text-destructive data-[active=true]:text-destructive data-[active=true]:bg-destructive/10 data-[active=true]:font-medium transition-all"
                    tooltip={t(item.title)}
                  >
                    <item.icon className="opacity-70 group-data-[active=true]:opacity-100" />
                    <span>{t(item.title)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        {user.plan === "pro" ? (
            <Link href="/dashboard/billing" className="w-full">
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground w-full">
                <Settings className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{t('footer.manageSubscription')}</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard/billing" className="w-full">
              <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full shadow-sm">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{t('footer.upgradePro')}</span>
              </div>
            </Link>
          )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
