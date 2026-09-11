import { requireUser } from "@/lib/auth-session"
import { getPublicAppSettings } from "@/features/admin/server/settings"
import { AIGenerationForm } from "@/features/ai/components/ai-generation-form"

import { getTranslations } from "next-intl/server"

export default async function AIGenerationPage() {
  const [t, settings] = await Promise.all([
    getTranslations('AI'),
    getPublicAppSettings(),
    requireUser(),
  ]);

  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-7xl mx-auto w-full p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary/60 animate-pulse"></span>
            {t('desc')}
          </p>
        </div>
      </div>

      <AIGenerationForm settings={settings} />
    </div>
  );
}
