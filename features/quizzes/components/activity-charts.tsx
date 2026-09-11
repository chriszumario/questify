"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Target, TrendingUp, Trophy } from "lucide-react"

import { useTranslations } from "next-intl"

interface ActivityChartsProps {
  data: {
    id: string
    score: number | null
    completedAt: Date | null
    quizTitle: string
  }[]
}

export function ActivityCharts({ data }: ActivityChartsProps) {
  const t = useTranslations("Dashboard.metrics")

  // Filter out incomplete and sort by date ascending
  const validData = data
    .filter(d => d.completedAt !== null && d.score !== null)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())

  // Format data for chart
  const chartData = validData.map(d => ({
    name: format(new Date(d.completedAt!), "MMM dd"),
    score: d.score,
    quizTitle: d.quizTitle
  }))

  const totalQuizzes = validData.length
  const avgScore = totalQuizzes > 0
    ? Math.round(validData.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalQuizzes)
    : 0

  const highestScore = validData.length > 0
    ? Math.max(...validData.map(d => d.score || 0))
    : 0

  if (chartData.length === 0) return null

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group rounded-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalQuizzes")}</CardTitle>
          <Target className="h-4 w-4 text-primary opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-primary">{totalQuizzes}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group rounded-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("averageScore")}</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-primary">{avgScore}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group rounded-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("highestScore")}</CardTitle>
          <Trophy className="h-4 w-4 text-primary opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-primary">{highestScore}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>{t("performanceHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--foreground)'
                  }}
                  itemStyle={{ color: 'var(--chart-1)', fontWeight: 'bold' }}
                  labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                  formatter={(value, _name, item) => [
                    `${String(value)} pts`,
                    String((item.payload as { quizTitle?: string }).quizTitle ?? "")
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "var(--chart-1)", stroke: "var(--card)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
