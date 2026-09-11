"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("CommonError");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
