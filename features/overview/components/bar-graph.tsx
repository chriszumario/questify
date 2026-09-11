"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
    label: "Quiz Attempts",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function BarGraph({ data }: { data: CreatorChartPoint[] }) {
  const t = useTranslations('Dashboard.graphs');
  const locale = useLocale();

  return (
    <>
      <CardHeader>
        <CardTitle>{t('participantsTitle')}</CardTitle>
        <CardDescription>{t('participantsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-[310px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="var(--muted-foreground)"
              tickFormatter={(value: string) => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="attempts" fill="var(--color-attempts)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}
