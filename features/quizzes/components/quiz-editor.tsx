"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Trash2,
  CheckCircle2,
  Circle,
  Save,
  Play,
  Settings,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useQuizEditor } from "@/features/quizzes/hooks/use-quiz-editor";
import { CreateQuizForm } from "./create-quiz-form";
import type { QuizDetails } from "@/features/quizzes/types";
import type {
  QuizQuestionInput,
  QuizAnswerInput,
} from "@/features/quizzes/schemas/quiz.schema";

// ── Sub-components ─────────────────────────────────────────────────────────────

interface QuizPublishToggleProps {
  isPublished: boolean;
  isPending: boolean;
  onToggle: (checked: boolean) => void;
}

function QuizPublishToggle({
  isPublished,
  isPending,
  onToggle,
}: QuizPublishToggleProps) {
  const t = useTranslations("Quizzes.editor");
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/40 mb-8">
      <div className="space-y-0.5">
        <Label className="text-base font-semibold">{t("liveLabel")}</Label>
        <p className="text-sm text-muted-foreground">
          {isPublished ? t("liveDescLive") : t("liveDescDraft")}
        </p>
      </div>
      <Switch
        checked={isPublished}
        onCheckedChange={onToggle}
        disabled={isPending}
        className="data-[state=checked]:bg-emerald-500"
      />
    </div>
  );
}

interface QuizAnswerItemProps {
  answer: QuizAnswerInput;
  answerIndex: number;
  inputId: string;
  error?: string;
  canRemove: boolean;
  onToggleCorrect: () => void;
  onUpdateContent: (content: string) => void;
  onRemove: () => void;
}

function QuizAnswerItem({
  answer,
  answerIndex,
  inputId,
  error,
  canRemove,
  onToggleCorrect,
  onUpdateContent,
  onRemove,
}: QuizAnswerItemProps) {
  const t = useTranslations("Quizzes.editor");
  return (
    <Field data-invalid={!!error || undefined} className="gap-1">
      <div className="group/answer flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleCorrect}
          aria-label={t("markCorrect", { number: answerIndex + 1 })}
          aria-pressed={answer.isCorrect}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
            answer.isCorrect
              ? "bg-emerald-500/20 text-emerald-500"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {answer.isCorrect ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <Circle className="size-5" />
          )}
        </button>
        <Input
          id={inputId}
          value={answer.content}
          onChange={(e) => onUpdateContent(e.target.value)}
          placeholder={t("optionPlaceholder", { number: answerIndex + 1 })}
          aria-label={t("optionPlaceholder", { number: answerIndex + 1 })}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "h-10 border-transparent bg-transparent transition-all hover:border-border/50 focus:border-primary/50",
            answer.isCorrect &&
              "font-medium text-emerald-600 dark:text-emerald-400",
          )}
        />
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            type="button"
            aria-label={t("deleteOption", { number: answerIndex + 1 })}
            className="size-8 rounded-full text-muted-foreground opacity-0 group-hover/answer:opacity-100 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
      {error ? (
        <FieldError id={`${inputId}-error`} className="pl-9">
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}

interface QuizQuestionItemProps {
  question: QuizQuestionInput;
  questionIndex: number;
  totalQuestions: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateContent: (content: string) => void;
  onAddAnswer: () => void;
  onRemoveAnswer: (answerIndex: number) => void;
  onUpdateAnswer: (answerIndex: number, content: string) => void;
  onToggleCorrect: (answerIndex: number) => void;
  questionError?: string;
  answersError?: string;
  answerErrors: Array<string | undefined>;
}

function QuizQuestionItem({
  question,
  questionIndex,
  totalQuestions,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdateContent,
  onAddAnswer,
  onRemoveAnswer,
  onUpdateAnswer,
  onToggleCorrect,
  questionError,
  answersError,
  answerErrors,
}: QuizQuestionItemProps) {
  const t = useTranslations("Quizzes.editor");
  const questionId = `question-${questionIndex}`;
  return (
    <div className="bg-card/40 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 group relative">
      <div className="flex justify-between items-start gap-4 mb-6">
        <Field className="flex-1" data-invalid={!!questionError || undefined}>
          <FieldLabel
            htmlFor={questionId}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {t("question", { number: questionIndex + 1 })}
          </FieldLabel>
          <Textarea
            id={questionId}
            value={question.content}
            onChange={(e) => onUpdateContent(e.target.value)}
            placeholder={t("questionPlaceholder")}
            aria-invalid={!!questionError}
            aria-describedby={questionError ? `${questionId}-error` : undefined}
            className="text-lg font-medium resize-none border-transparent hover:border-border/50 focus:border-primary/50 bg-transparent hover:bg-background/50 focus:bg-background/80 transition-all rounded-xl py-3"
            rows={2}
          />
          {questionError ? (
            <FieldError id={`${questionId}-error`}>{questionError}</FieldError>
          ) : null}
        </Field>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={questionIndex === 0}
            title={t("moveUp")}
            aria-label={t("moveUp")}
            className="text-muted-foreground hover:text-foreground rounded-full h-8 w-8 disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={questionIndex === totalQuestions - 1}
            title={t("moveDown")}
            aria-label={t("moveDown")}
            className="text-muted-foreground hover:text-foreground rounded-full h-8 w-8 disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            title={t("deleteQuestion")}
            aria-label={t("deleteQuestion")}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 ml-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 pl-4 border-l-2 border-border/40 ml-2">
        {question.answers.map((answer, aIndex) => (
          <QuizAnswerItem
            key={answer.id ?? aIndex}
            answer={answer}
            answerIndex={aIndex}
            inputId={`${questionId}-answer-${aIndex}`}
            error={answerErrors[aIndex]}
            canRemove={question.answers.length > 2}
            onToggleCorrect={() => onToggleCorrect(aIndex)}
            onUpdateContent={(content) => onUpdateAnswer(aIndex, content)}
            onRemove={() => onRemoveAnswer(aIndex)}
          />
        ))}
        {answersError ? <FieldError>{answersError}</FieldError> : null}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddAnswer}
          className="text-muted-foreground hover:text-primary mt-2 ml-9 rounded-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> {t("addOption")}
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

interface QuizEditorProps {
  quizId: string;
  initialQuestions: QuizQuestionInput[];
  initialIsPublished?: boolean;
  quizDetails: QuizDetails;
}

export function QuizEditor({
  quizId,
  initialQuestions,
  initialIsPublished = false,
  quizDetails,
}: QuizEditorProps) {
  const t = useTranslations("Quizzes.editor");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const {
    questions,
    isPending,
    isSaved,
    error,
    fieldErrors,
    isPublished,
    addQuestion,
    removeQuestion,
    moveQuestion,
    updateQuestion,
    addAnswer,
    removeAnswer,
    updateAnswer,
    toggleCorrectAnswer,
    handleSave,
    handleTogglePublish,
  } = useQuizEditor({
    quizId,
    initialQuestions,
    initialIsPublished,
    translateValidation: (key) => t(key as Parameters<typeof t>[0]),
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Sticky Header */}
      <div className="flex flex-col md:flex-row items-center justify-between sticky top-16 z-10 bg-background/80 backdrop-blur-xl py-4 border-b border-border/40 gap-4">
        <h3 className="text-xl font-bold flex-1">{t("title")}</h3>
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="rounded-full shadow-sm">
                  <Settings className="mr-2 h-4 w-4" /> {t("settings")}
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[600px] border-border/40 bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>{t("settings")}</DialogTitle>
                <DialogDescription>{t("settingsDesc")}</DialogDescription>
              </DialogHeader>
              <CreateQuizForm
                initialData={quizDetails}
                onSuccess={() => setIsSettingsOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Link href={`/q/${quizId}`} target="_blank">
            <Button variant="outline" className="rounded-full shadow-sm">
              <Play className="mr-2 h-4 w-4" /> {t("preview")}
            </Button>
          </Link>

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full shadow-lg shadow-primary/25 bg-primary/90 hover:bg-primary min-w-[120px]"
          >
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : isSaved ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isPending ? t("saving") : isSaved ? t("saved") : t("saveAll")}
          </Button>
        </div>
      </div>

      <QuizPublishToggle
        isPublished={isPublished}
        isPending={isPending}
        onToggle={handleTogglePublish}
      />

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <QuizQuestionItem
            key={q.id ?? qIndex}
            question={q}
            questionIndex={qIndex}
            totalQuestions={questions.length}
            onRemove={() => removeQuestion(qIndex)}
            onMoveUp={() => moveQuestion(qIndex, qIndex - 1)}
            onMoveDown={() => moveQuestion(qIndex, qIndex + 1)}
            onUpdateContent={(content) => updateQuestion(qIndex, content)}
            onAddAnswer={() => addAnswer(qIndex)}
            onRemoveAnswer={(aIndex) => removeAnswer(qIndex, aIndex)}
            onUpdateAnswer={(aIndex, content) =>
              updateAnswer(qIndex, aIndex, content)
            }
            onToggleCorrect={(aIndex) => toggleCorrectAnswer(qIndex, aIndex)}
            questionError={fieldErrors[`${qIndex}.content`]}
            answersError={fieldErrors[`${qIndex}.answers`]}
            answerErrors={q.answers.map(
              (_, answerIndex) =>
                fieldErrors[`${qIndex}.answers.${answerIndex}.content`],
            )}
          />
        ))}

        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={addQuestion}
            className="rounded-full shadow-lg border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> {t("addQuestion")}
          </Button>
        </div>
      </div>
    </div>
  );
}
