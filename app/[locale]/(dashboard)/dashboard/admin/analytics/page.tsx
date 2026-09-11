import { getAdminGrowthData, getAdminPlanBreakdown, getAdminPlatformMetrics } from "@/features/admin/server/analytics"
import { AnalyticsCharts } from "@/features/admin/components/analytics-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileQuestion, Target, BarChart3 } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function AdminAnalyticsPage() {
  const [t, metrics, growthData, planData] = await Promise.all([
    getTranslations('AdminAnalytics'),
    getAdminPlatformMetrics(),
    getAdminGrowthData(30),
    getAdminPlanBreakdown(),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('desc')}
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('totalUsersDesc')}</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalQuizzes')}</CardTitle>
            <FileQuestion className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.quizzes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('totalQuizzesDesc')}</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('quizAttempts')}</CardTitle>
            <Target className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.attempts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('quizAttemptsDesc')}</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('activePolls')}</CardTitle>
            <BarChart3 className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.polls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('activePollsDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <AnalyticsCharts data={growthData} planData={planData} />
    </div>
  )
}
