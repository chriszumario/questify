"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Loader2, Award, ArrowRight, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useQuizPlayer } from "@/features/quizzes/hooks/use-quiz-player";
import { QuizResults } from "./quiz-results";
import type { PlayerQuestion, PlayerQuiz } from "@/features/quizzes/types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface QuizProgressBarProps {
  current: number;
  total: number;
}

function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const t = useTranslations("Quizzes.player");
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="flex-1 mr-8">
      <div className="flex justify-between text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-2">
        <span>{t("questionOf", { current: current + 1, total })}</span>
        <span>{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        className="h-2 w-full bg-muted/50 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface QuizTimerProps {
  timeLeft: number;
}

function QuizTimer({ timeLeft }: QuizTimerProps) {
  const t = useTranslations("Quizzes.player");
  return (
    <div
      role="timer"
      aria-label={t("timeRemaining", { time: formatTime(timeLeft) })}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold border transition-colors",
        timeLeft <= 30
          ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
          : "bg-card/50 text-foreground border-border/50"
      )}
    >
      <Timer className="w-5 h-5" />
      {formatTime(timeLeft)}
    </div>
  );
}

interface QuizIntroScreenProps {
  quiz: PlayerQuiz;
  questions: PlayerQuestion[];
  isAuthenticated: boolean;
  guestName: string;
  onGuestNameChange: (name: string) => void;
  onStart: () => void;
  attemptStatus?: {
    remaining: number;
    maxAttempts: number;
  };
}

function QuizIntroScreen({
  quiz,
  questions,
  isAuthenticated,
  guestName,
  onGuestNameChange,
  onStart,
  attemptStatus,
}: QuizIntroScreenProps) {
  const t = useTranslations("Quizzes.player");
  return (
    <div className="flex flex-col items-center justify-center h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-700 w-full px-4 py-8">
      <div className="text-center max-w-2xl w-full bg-card/30 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl my-auto">
        <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mx-auto mb-6">
          <Award className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">{quiz.description}</p>
        )}

        {quiz.timeLimit && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm font-medium mb-8">
            <Timer className="w-4 h-4 text-muted-foreground" />
            {t("timeLimit", { minutes: Math.ceil(quiz.timeLimit / 60) })}
          </div>
        )}

        {attemptStatus ? (
          <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-300">
            {t("attemptsRemaining", attemptStatus)}
          </div>
        ) : null}

        {questions.length === 0 ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive mb-8 font-medium">
            {t("noQuestions")}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto w-full min-h-35 justify-center">
                {!isAuthenticated && (
                  <>
                    <input
                      type="text"
                      aria-label={t("nicknamePlaceholder")}
                      autoComplete="nickname"
                      maxLength={80}
                      placeholder={t("nicknamePlaceholder")}
                      value={guestName}
                      onChange={(e) => onGuestNameChange(e.target.value)}
                      className="flex h-14 w-full rounded-2xl border border-input/50 bg-background/80 px-4 py-2 text-center text-lg ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                    <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl font-medium text-left">
                      {t("guestWarning")}{" "}
                      <Link href="/sign-in" className="underline ml-1 font-bold">
                        {t("logIn")}
                      </Link>{" "}
                      {t("guestWarningEnd")}
                    </div>
                  </>
                )}
                <Button
                  onClick={onStart}
                  size="lg"
                  className="w-full rounded-2xl h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/30 transition-all duration-300"
                >
                  {t("start")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface QuizQuestionCardProps {
  question: PlayerQuestion;
  answerOrder?: string[];
  selectedAnswerId: string | undefined;
  onSelectAnswer: (questionId: string, answerId: string) => void;
}

function QuizQuestionCard({ question, answerOrder, selectedAnswerId, onSelectAnswer }: QuizQuestionCardProps) {
  const displayedAnswers = answerOrder
    ? answerOrder.flatMap((answerId) => {
        const answer = question.answers.find((candidate) => candidate.id === answerId);
        return answer ? [answer] : [];
      })
    : question.answers;

  return (
    <div key={question.id} className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-8 fade-in duration-500 fill-mode-both">
      <div className="shrink-0 mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-foreground tracking-tight">
          {question.content}
        </h2>
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-8 pr-2 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border/50 hover:[&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
          {displayedAnswers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <button
                key={answer.id}
                onClick={() => onSelectAnswer(question.id, answer.id)}
                aria-pressed={isSelected}
                className={cn(
                  "w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border/50 hover:border-primary/40 hover:bg-muted/30 bg-card/30 backdrop-blur-sm"
                )}
              >
                <div
                  className={cn(
                    "shrink-0 flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/50 group-hover:border-primary/50 text-transparent bg-background/50"
                  )}
                >
                  {isSelected && <CheckCircle2 className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "text-base md:text-lg font-medium transition-colors",
                    isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {answer.content}
                </span>
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent z-10" />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface QuizPlayerProps {
  quiz: PlayerQuiz;
  questions: PlayerQuestion[];
  isAuthenticated: boolean;
  attemptStatus?: {
    remaining: number;
    maxAttempts: number;
  };
}

export function QuizPlayer({ quiz, questions, isAuthenticated, attemptStatus }: QuizPlayerProps) {
  const t = useTranslations("Quizzes.player");
  const {
    currentStep,
    userAnswers,
    answerOrder,
    result,
    guestName,
    timeLeft,
    isPending,
    error,
    handleStart,
    handleSelectAnswer,
    handleNext,
    setGuestName,
  } = useQuizPlayer({ quiz, questions });

  const maxPoints = questions.reduce((sum, question) => sum + (question.points ?? 1), 0);

  if (result) {
    return (
      <QuizResults
        quizTitle={quiz.title}
        score={result.score}
        totalPoints={maxPoints}
        quizId={quiz.id}
        userQuizId={result.userQuizId}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  if (currentStep === -1) {
    return (
      <QuizIntroScreen
        quiz={quiz}
        questions={questions}
        isAuthenticated={isAuthenticated}
        guestName={guestName}
        onGuestNameChange={setGuestName}
        onStart={handleStart}
        attemptStatus={attemptStatus}
      />
    );
  }

  const currentQuestion = questions[currentStep];
  if (!currentQuestion) return null;

  const isLastQuestion = currentStep === questions.length - 1;
  const selectedAnswerId = userAnswers[currentQuestion.id];

  return (
    <div className="max-w-3xl mx-auto w-full h-full flex flex-col relative pt-6 pb-6 px-4">
      {/* Header: Progress & Timer */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <QuizProgressBar current={currentStep} total={questions.length} />
        {timeLeft !== null && <QuizTimer timeLeft={timeLeft} />}
      </div>

      <QuizQuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        answerOrder={answerOrder[currentQuestion.id]}
        selectedAnswerId={selectedAnswerId}
        onSelectAnswer={handleSelectAnswer}
      />

      <div className="shrink-0 flex justify-end pt-6 mt-4">
        {error && <p role="alert" className="mr-auto self-center text-sm font-medium text-destructive">{error}</p>}
        <Button
          onClick={handleNext}
          disabled={!selectedAnswerId || isPending}
          title={!selectedAnswerId ? "Please select an answer to continue" : ""}
          size="lg"
          className={cn(
            "rounded-2xl h-14 px-8 text-lg font-bold shadow-xl transition-all duration-300",
            selectedAnswerId && !isPending ? "shadow-primary/25 hover:-translate-y-1" : "opacity-50 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : isLastQuestion ? (
            t("submit")
          ) : (
            <>{t("next")} <ChevronRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
