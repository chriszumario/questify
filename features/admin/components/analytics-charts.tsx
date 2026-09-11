"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Label, Pie, PieChart } from "recharts"
import { TrendingUp } from "lucide-react"

import { useTranslations } from "next-intl"

type GrowthData = {
  date: string
  signups: number
  attempts: number
}

type PlanData = {
  pro: number
  free: number
}

export function AnalyticsCharts({ data, planData }: { data: GrowthData[]; planData: PlanData }) {
  const t = useTranslations('AdminAnalytics.charts');
  const totalUsers = planData.pro + planData.free
  const proPercentage = totalUsers > 0
    ? Math.round((planData.pro / totalUsers) * 100)
    : 0
  const freePercentage = totalUsers > 0 ? 100 - proPercentage : 0
  const planChartData = totalUsers > 0
    ? [
        { name: t('proUsers'), value: planData.pro, color: 'var(--chart-3)' },
        { name: t('freeUsers'), value: planData.free, color: 'var(--chart-1)' },
      ]
    : [{ name: t('noUsers'), value: 1, color: 'var(--muted)' }]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>{t('userGrowth')}</CardTitle>
          <CardDescription>{t('userGrowthDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--popover-foreground)' }}
                  itemStyle={{ color: 'var(--popover-foreground)' }}
                  labelStyle={{ color: 'var(--muted-foreground)' }}
                />
                <Area type="monotone" dataKey="signups" stroke="var(--chart-1)" strokeWidth={2} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>{t('quizActivity')}</CardTitle>
          <CardDescription>{t('quizActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--popover-foreground)' }}
                  itemStyle={{ color: 'var(--popover-foreground)' }}
                  labelStyle={{ color: 'var(--muted-foreground)' }}
                  cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
                />
                <Bar dataKey="attempts" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/40 shadow-sm lg:col-span-2">
        <CardHeader className="border-b border-border/40 bg-muted/10">
          <div className="space-y-1.5">
            <CardTitle>{t('planMix')}</CardTitle>
            <CardDescription>{t('planMixDesc')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 py-6 md:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] md:items-center">
          <div className="mx-auto h-65 w-full max-w-90" aria-label={t('planMix')}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer>
                <Pie
                  data={planChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={totalUsers > 0 ? 4 : 0}
                  cornerRadius={totalUsers > 0 ? 7 : 0}
                  strokeWidth={0}
                >
                  {planChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null

                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalUsers > 0 ? `${proPercentage}%` : '—'}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-xs">
                            {totalUsers > 0 ? t('proConversion') : t('noUsers')}
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
                {totalUsers > 0 ? (
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '10px', color: 'var(--popover-foreground)' }}
                    itemStyle={{ color: 'var(--popover-foreground)' }}
                    formatter={(value) => Number(value).toLocaleString()}
                  />
                ) : null}
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">{t('proUsers')}</span>
                  <span className="size-2.5 shrink-0 rounded-full bg-chart-3" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{planData.pro.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('shareOfUsers', { percentage: proPercentage })}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">{t('freeUsers')}</span>
                  <span className="size-2.5 shrink-0 rounded-full bg-chart-1" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{planData.free.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('shareOfUsers', { percentage: freePercentage })}</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <TrendingUp className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t('planInsightTitle')}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {totalUsers > 0
                    ? t('planInsight', { pro: planData.pro, total: totalUsers, percentage: proPercentage })
                    : t('planNoDataInsight')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
