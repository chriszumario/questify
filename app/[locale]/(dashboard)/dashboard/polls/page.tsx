import { requireUser } from "@/lib/auth-session";
import { getUserPolls } from "@/features/polls/server/queries";
import { PollCard } from "@/features/polls/components/poll-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function PollsPage() {
  const [t, user] = await Promise.all([getTranslations('Polls'), requireUser()]);

  const polls = await getUserPolls(user.id);

  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-7xl mx-auto w-full p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('desc')}
          </p>
        </div>
        <Link href="/dashboard/polls/create">
          <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary/90 hover:bg-primary transition-all duration-200">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('createNew')}
          </Button>
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] border border-dashed rounded-3xl bg-card/10 backdrop-blur-sm animate-in fade-in duration-700">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <BarChart2 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-center">{t('noPolls')}</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2 mb-8">
            {t('noPollsDesc')}
          </p>
          <Link href="/dashboard/polls/create">
            <Button size="lg" className="rounded-full shadow-xl hover:-translate-y-1 transition-all duration-300">
              {t('buildFirst')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {polls.map((poll) => (
            <PollCard 
              key={poll.id} 
              id={poll.id}
              question={poll.question}
              isPublished={poll.isPublished}
              createdAt={poll.createdAt}
              votesCount={poll.votesCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
