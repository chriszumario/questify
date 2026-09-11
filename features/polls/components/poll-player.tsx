"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, PieChart } from "lucide-react";
import { submitPollVote } from "@/features/polls/server/actions";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import { toast } from "sonner";
import { Link } from "@/i18n/routing";

interface PollOption {
  id: string;
  text: string;
}

interface PollPlayerProps {
  poll: {
    id: string;
    question: string;
  };
  options: PollOption[];
  isAuthenticated: boolean;
}

function VotedScreen() {
  const t = useTranslations("Polls.player");
  return (
    <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 w-full max-w-lg mx-auto">
      <div className="bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-10 text-center shadow-2xl shadow-primary/10 w-full">
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <PieChart className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-black mb-2">{t("voteRecorded")}</h2>
        <p className="text-muted-foreground">{t("thankYou")}</p>
      </div>
    </div>
  );
}

export function PollPlayer({ poll, options, isAuthenticated }: PollPlayerProps) {
  const t = useTranslations("Polls.player");
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [hasVoted, setHasVoted] = React.useState(false);

  const handleSubmit = () => {
    if (!selectedOption) return;
    startTransition(async () => {
      try {
        await submitPollVote(poll.id, selectedOption);
        setHasVoted(true);
        toast.success(t("voteRecorded"));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("voteError"));
      }
    });
  };

  if (hasVoted) return <VotedScreen />;

  return (
    <div className="max-w-xl mx-auto w-full pt-12 pb-24 px-4 flex flex-col justify-center animate-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {poll.question}
        </h2>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-2xl border bg-card/50 p-6 text-center shadow-sm">
          <h3 className="text-lg font-semibold">{t("authRequiredTitle")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("authRequiredDesc")}</p>
          <Button render={<Link href="/sign-in" />} className="mt-5 w-full rounded-full">
            {t("signIn")}
          </Button>
        </div>
      ) : (
        <>
      <div className="space-y-4 mb-10">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              aria-pressed={isSelected}
              className={cn(
                "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border/50 hover:border-primary/50 hover:bg-muted/50 bg-card/50 backdrop-blur-sm"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground group-hover:border-primary/50 text-transparent"
                )}
              >
                {isSelected && <CheckCircle2 className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  "text-lg font-medium transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || isPending}
          size="lg"
          className="rounded-full h-14 w-full px-8 text-lg shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all duration-300"
        >
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {t("submitVote")}
        </Button>
      </div>
        </>
      )}
    </div>
  );
}
