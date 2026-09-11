"use client";
import { Label, Pie, PieChart } from "recharts";
import { useTranslations } from "next-intl";
import type { CreatorMetrics } from "../types";

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
  count: {
    label: "Answers",
  },
  correct: {
    label: "Correct",
    color: "var(--chart-2)",
  },
  incorrect: {
    label: "Incorrect",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

export function PieGraph({ metrics }: { metrics: CreatorMetrics }) {
  const t = useTranslations('Dashboard.graphs');
  const incorrectAnswers = Math.max(
    metrics.totalAnswers - metrics.totalCorrect,
    0,
  );
  const hasAnswers = metrics.totalAnswers > 0;
  const chartData = hasAnswers
    ? [
        {
          type: "correct",
          count: metrics.totalCorrect,
          fill: "var(--color-correct)",
        },
        {
          type: "incorrect",
          count: incorrectAnswers,
          fill: "var(--color-incorrect)",
        },
      ]
    : [{ type: "empty", count: 1, fill: "var(--muted)" }];

  return (
    <>
      <CardHeader className="w-full pb-0">
        <CardTitle>{t('accuracyTitle')}</CardTitle>
        <CardDescription>{t('accuracyDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-3 pt-2 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[230px] w-full max-w-[320px]"
          aria-label={t('accuracyTitle')}
        >
          <PieChart accessibilityLayer>
            {hasAnswers ? (
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            ) : null}
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              innerRadius={66}
              outerRadius={92}
              paddingAngle={hasAnswers ? 3 : 0}
              cornerRadius={hasAnswers ? 6 : 0}
              strokeWidth={0}
              isAnimationActive={hasAnswers}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {metrics.averageScore}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {t('accuracy')}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
            <span
              className="size-2.5 shrink-0 rounded-full bg-(--chart-2)"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {t('correct')}
            </span>
            <span className="font-semibold tabular-nums">
              {metrics.totalCorrect.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
            <span
              className="size-2.5 shrink-0 rounded-full bg-destructive"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {t('incorrect')}
            </span>
            <span className="font-semibold tabular-nums">
              {incorrectAnswers.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </>
  );
}
