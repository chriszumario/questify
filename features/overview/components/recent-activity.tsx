import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/routing";
import { formatDistanceToNow } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { ExternalLink, Inbox } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CreatorActivityItem } from "../types";

export function RecentActivity({ activity }: { activity: CreatorActivityItem[] }) {
  const t = useTranslations('Dashboard.recentActivity');
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  if (!activity || activity.length === 0) {
    return (
      <div className="flex min-h-[260px] w-full flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Inbox className="size-6" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-foreground">{t('empty')}</p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {t('emptyHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5">
      {activity.map((item) => {
        const name = item.userName || item.guestName || t('guest');
        const initials = name.slice(0, 2).toUpperCase();
        
        return (
          <div key={item.id} className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto]">
            <Avatar className="h-9 w-9 self-start sm:self-center">
              {item.userImage ? <AvatarImage src={item.userImage} alt={name} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium leading-none truncate">{name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {t('took', { quizTitle: item.quizTitle })}
              </p>
            </div>
            <div className="col-start-2 flex min-w-0 items-center justify-between gap-2 sm:col-start-auto sm:justify-end sm:gap-3">
              <div className="min-w-0 text-left sm:text-right">
                <div className="truncate text-sm font-medium">{item.completedAt ? t('score', { score: item.score || 0 }) : t('inProgress')}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {formatDistanceToNow(item.startedAt, { addSuffix: true, locale: dateLocale })}
                </div>
              </div>
              <Link href={`/dashboard/activity/${item.quizId}?attemptId=${item.id}`} className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title={t('viewDetailed')} aria-label={t('viewDetailed')}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
