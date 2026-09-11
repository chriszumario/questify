import { requireUser } from "@/lib/auth-session"
import { getParticipantActivity } from "@/features/quizzes/server/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow, differenceInSeconds } from "date-fns"
import { Target, Clock, Trophy, CheckCircle2, XCircle } from "lucide-react"
import { ActivityCharts } from "@/features/quizzes/components/activity-charts"
import { Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import { getTranslations } from "next-intl/server"

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default async function ActivityPage() {
  const [t, user] = await Promise.all([
    getTranslations('Dashboard.activity'),
    requireUser(),
  ])

  const activities = await getParticipantActivity(user.id)

  const chartData = activities.map(a => ({
    id: a.id,
    score: a.score,
    completedAt: a.completedAt,
    quizTitle: a.quiz?.title || "Unknown"
  }))

  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-7xl mx-auto w-full p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t('title')}
        </h2>
      </div>

      <ActivityCharts data={chartData} />

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card/20 backdrop-blur-md rounded-2xl border border-dashed border-white/20">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {t('emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => {
            const correct = activity.userAnswers?.filter(a => a.answer?.isCorrect).length || 0;
            const totalAnswered = activity.userAnswers?.length || 0;
            const incorrect = totalAnswered - correct;
            const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
            
            let timeString = t('inProgress');
            if (activity.completedAt && activity.startedAt) {
              const seconds = differenceInSeconds(new Date(activity.completedAt), new Date(activity.startedAt));
              timeString = formatTime(seconds);
            }

            return (
              <Link href={`/dashboard/activity/${activity.quizId}?attemptId=${activity.id}`} key={activity.id}>
                <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group h-full flex flex-col rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative z-10 pb-4 border-b border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors pr-2">
                        {activity.quiz?.title || t('unknownQuiz')}
                      </CardTitle>
                      {activity.completedAt && (
                        <Badge variant="outline" className="shrink-0 bg-primary/10 text-primary border-primary/20">
                          {t('accuracy', { acc: accuracy })}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.completedAt ? formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true }) : t('incomplete')}
                      </span>
                      {activity.completedAt && (
                        <span className="flex items-center gap-1 text-muted-foreground/80">
                          ⏱️ {timeString}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 flex-1 flex flex-col justify-end pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{t('score')}</p>
                          <p className="text-2xl font-black group-hover:text-primary transition-colors">{activity.score || 0}</p>
                        </div>
                      </div>

                      {activity.completedAt && (
                        <div className="flex flex-col gap-1.5 text-xs font-medium">
                          <div className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {correct} {t('correct')}
                          </div>
                          <div className="flex items-center gap-1.5 text-destructive">
                            <XCircle className="w-3.5 h-3.5" />
                            {incorrect} {t('incorrect')}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
