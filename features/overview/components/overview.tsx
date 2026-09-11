"use client";

import { Users, FileQuestion, CheckSquare, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CreatorActivityItem, CreatorChartPoint, CreatorMetrics } from "../types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaGraph } from "./area-graph";
import { BarGraph } from "./bar-graph";
import { PieGraph } from "./pie-graph";
import { RecentActivity } from "./recent-activity";

interface OverViewPageProps {
  metrics: CreatorMetrics;
  chartData: CreatorChartPoint[];
  recentActivity: CreatorActivityItem[];
}

export function OverViewPage({ metrics, chartData, recentActivity }: OverViewPageProps) {
  const t = useTranslations('Dashboard');
  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-7xl mx-auto w-full p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t('title')}
        </h2>
      </div>
      <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{t('metrics.totalQuizzes')}</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-full">
                  <FileQuestion className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black">{metrics.quizzes.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{t('metrics.totalPolls')}</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <CheckSquare className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black">{metrics.polls.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{t('metrics.totalPlayers')}</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black">{metrics.players.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{t('metrics.averageScore')}</CardTitle>
                <div className="p-2 bg-rose-500/10 rounded-full">
                  <Target className="h-4 w-4 text-rose-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black">{metrics.averageScore}%</div>
                <div className="flex items-center pt-2 text-xs font-medium text-muted-foreground">
                  {t('metrics.acrossAll')}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="min-w-0 bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 rounded-2xl shadow-xl shadow-black/5 flex flex-col overflow-hidden h-full lg:col-span-4">
              <BarGraph data={chartData} />
            </Card>
            <Card className="min-w-0 bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 rounded-2xl overflow-hidden flex flex-col h-full lg:col-span-3">
              <CardHeader className="bg-muted/10 border-b border-white/5">
                <CardTitle className="text-lg font-bold">{t('recentActivity.title')}</CardTitle>
                <CardDescription>
                  {t('recentActivity.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-w-0 flex-1 overflow-hidden pt-6">
                <RecentActivity activity={recentActivity} />
              </CardContent>
            </Card>
            <Card className="min-w-0 bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 rounded-2xl shadow-xl shadow-black/5 flex flex-col overflow-hidden h-full lg:col-span-4">
              <AreaGraph data={chartData} />
            </Card>
            <Card className="min-w-0 bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl shadow-black/5 flex flex-col rounded-2xl overflow-hidden h-full lg:col-span-3">
              <PieGraph metrics={metrics} />
            </Card>
          </div>
      </div>
    </div>
  );
}
