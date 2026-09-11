import { OverViewPage } from "@/features/overview/components/overview";
import { getCreatorMetrics, getCreatorChartData, getCreatorRecentActivity } from "@/features/overview/server/queries";

export default async function DashboardPage() {
  const [metrics, chartData, recentActivity] = await Promise.all([
    getCreatorMetrics(),
    getCreatorChartData(),
    getCreatorRecentActivity(),
  ]);

  return <OverViewPage metrics={metrics} chartData={chartData} recentActivity={recentActivity} />;
}
