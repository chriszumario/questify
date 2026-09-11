import { getAdminAppSettings } from "@/features/admin/server/settings"
import { PlatformSettingsForm } from "@/features/admin/components/platform-settings-form"
import { Settings } from "lucide-react"

import { getTranslations } from "next-intl/server"

export default async function AdminSettingsPage() {
  const t = await getTranslations('Settings');
  const settings = await getAdminAppSettings();

  return (
    <div className="flex w-full flex-col gap-6 px-2 pb-20 sm:px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('desc')}
        </p>
      </div>

      <PlatformSettingsForm initialSettings={settings} />
    </div>
  );
}
