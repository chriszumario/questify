import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const locale = await getLocale();
  redirect({ href: `/dashboard/quizzes/${resolvedParams.id}/edit`, locale });
}
