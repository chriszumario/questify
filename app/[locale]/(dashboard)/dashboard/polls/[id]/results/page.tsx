import { getPollResults } from "@/features/polls/server/queries";
import { requireUser } from "@/lib/auth-session";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Users, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function PollResultsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const [t, user] = await Promise.all([getTranslations('Polls.resultsPage'), requireUser()]);

  const poll = await getPollResults(id, user.id);

  if (!poll) {
    notFound();
  }

  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);

  // Calculate percentages and counts
  const resultsData = poll.options.map(option => {
    const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
    
    return {
      id: option.id,
      text: option.text,
      votes: option.votes,
      percentage
    };
  });

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/polls">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl overflow-hidden">
            <div className="h-3 w-full bg-gradient-to-r from-primary to-primary/40"></div>
            <CardHeader>
              <CardTitle className="text-2xl">{poll.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resultsData.map((res, index) => (
                <div key={res.id} className="space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-muted-foreground font-normal">#{index + 1}</span> {res.text}
                    </span>
                    <span className="font-bold">{res.votes} {t('votes')} ({res.percentage}%)</span>
                  </div>
                  <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${res.percentage}%` }}
                    />
                  </div>
                </div>
              ))}

              {totalVotes === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  {t('noVotes')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('totalEngagement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="text-4xl font-black">{totalVotes}</div>
                  <div className="text-sm text-muted-foreground">{t('totalVotes')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('status')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${poll.isPublished ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                <span className="font-semibold">{poll.isPublished ? t('live') : t('closed')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
