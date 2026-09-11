import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const locale = await getLocale();
  redirect({ href: `/dashboard/polls/${resolvedParams.id}/edit`, locale });
}
