import { SettingsNav } from "./components/settings-nav";
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("UserSettings");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings className="size-6 text-primary" aria-hidden="true" />
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("desc")}</p>
      </div>

      <SettingsNav />

      <div className="w-full">{children}</div>
    </div>
  );
}
