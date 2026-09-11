"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";
import type { CreatorChartPoint } from "../types";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  attempts: {
    label: "Engagement",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AreaGraph({ data }: { data: CreatorChartPoint[] }) {
  const t = useTranslations('Dashboard.graphs');
  const locale = useLocale();
  return (
    <>
      <CardHeader>
        <CardTitle>{t('trendTitle')}</CardTitle>
        <CardDescription>
          {t('trendDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-attempts)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-attempts)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              stroke="var(--muted-foreground)"
              tickFormatter={(value: string) => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))}
            />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="attempts"
              type="monotone"
              fill="url(#colorEngagement)"
              fillOpacity={1}
              stroke="var(--color-attempts)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}
