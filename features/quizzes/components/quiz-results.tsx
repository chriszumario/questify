"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function openSharePopup(url: string) {
  window.open(url, "share-popup", "width=600,height=600");
}

interface QuizResultsProps {
  quizTitle: string;
  score: number;
  totalPoints?: number;
  quizId: string;
  userQuizId?: string;
  isAuthenticated: boolean;
}

export function QuizResults({ quizTitle, score, totalPoints = 100, quizId, userQuizId, isAuthenticated }: QuizResultsProps) {
  const t = useTranslations("Quizzes.results");
  const locale = useLocale();
  const [copied, setCopied] = React.useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/results/${userQuizId ?? quizId}`
      : "";

  const shareText = t("shareText", { score, title: quizTitle });

  const chartData = [
    { name: t("points"), value: score, color: "var(--chart-1)" },
    { name: "Remaining", value: Math.max(0, totalPoints - score), color: "var(--muted)" },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  };

  const reviewHref = userQuizId
    ? `/dashboard/activity/${quizId}?attemptId=${userQuizId}`
    : "/dashboard/activity";

  return (
    <div className="flex flex-col items-center h-full overflow-y-auto animate-in zoom-in-95 duration-500 w-full px-4 py-6 md:py-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border/50 hover:[&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
      <Card className="w-full max-w-3xl my-auto bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-12 text-center shadow-2xl overflow-hidden relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

        <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <Award className="h-10 w-10 text-primary" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground mb-10 text-lg">
          {t("desc", { title: quizTitle })}
        </p>

        {/* Score Chart */}
        <div className="flex justify-center mb-10">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-black text-primary">
                {totalPoints > 0 ? `${Math.round((score / totalPoints) * 100)}%` : `${score}`}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                {score} / {totalPoints} {t("points")}
              </span>
            </div>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="border-t border-border/50 pt-8 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("shareResult")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Share on X"
              className="rounded-full hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-colors"
              onClick={() => openSharePopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`)}
            >
              <TwitterIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Share on LinkedIn"
              className="rounded-full hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 transition-colors"
              onClick={() => openSharePopup(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("My Quiz Result")}&summary=${encodeURIComponent(shareText)}`)}
            >
              <LinkedinIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className={copied ? "rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/50" : "rounded-full"}
              onClick={handleCopyLink}
            >
              {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
              {copied ? t("copied") : t("copyLink")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {isAuthenticated ? (
            <Link href={reviewHref} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-full h-12 px-8 shadow-lg shadow-primary/20 bg-primary/90 hover:bg-primary font-semibold">
                {t("viewReview")}
              </Button>
            </Link>
          ) : (
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-full h-12 px-8 shadow-lg shadow-primary/20 bg-primary/90 hover:bg-primary font-semibold">
                {t("returnHome")}
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
