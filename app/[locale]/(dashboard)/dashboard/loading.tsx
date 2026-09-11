import { Spinner } from "@/components/ui/spinner";

export function LoadingSpinner() {
  return <Spinner className="size-8 text-primary" />;
}

export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-48 w-full flex-1 items-center justify-center"
      aria-busy="true"
    >
      <LoadingSpinner />
    </div>
  );
}
