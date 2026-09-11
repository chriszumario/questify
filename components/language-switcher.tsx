'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onValueChange(value: string | null) {
    if (!value) return;
    const nextLocale = value as 'en' | 'es';
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Select
      defaultValue={locale}
      onValueChange={onValueChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-30 bg-background/50 backdrop-blur-sm border-white/10 hover:bg-muted/50 transition-colors h-9">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={t('label')} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('en')}</SelectItem>
        <SelectItem value="es">{t('es')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
