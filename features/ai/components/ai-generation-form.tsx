"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, WandSparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { generateContentWithAI } from "@/features/ai/server/actions";
import { cn } from "@/lib/utils";

interface AIGenerationFormProps {
  settings: {
    ai_enabled: string;
    ai_max_questions: string;
  };
}

const categories = [
  "Education",
  "Technology",
  "Science",
  "History",
  "Entertainment",
  "Sports",
  "Business",
  "Other",
];

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
];

export function AIGenerationForm({ settings }: AIGenerationFormProps) {
  const t = useTranslations("AI");
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<"quiz" | "poll">("quiz");
  const [category, setCategory] = useState("Technology");
  const [language, setLanguage] = useState("English");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const configuredMaxQuestions = Number.parseInt(settings.ai_max_questions, 10);
  const maxQuestions =
    Number.isFinite(configuredMaxQuestions) && configuredMaxQuestions > 0
      ? configuredMaxQuestions
      : 20;
  const [count, setCount] = useState("5");
  const [errorMsg, setErrorMsg] = useState("");
  const [topicError, setTopicError] = useState("");
  const [countError, setCountError] = useState("");

  const validateTopic = (value: string) => {
    const normalizedTopic = value.trim();

    if (!normalizedTopic) return t("topicRequired");
    if (normalizedTopic.length < 3) return t("topicMinLength");
    if (normalizedTopic.length > 2000) return t("topicMaxLength");

    return "";
  };

  const validateCount = (value: string) => {
    const parsedCount = Number(value);

    if (
      !Number.isInteger(parsedCount) ||
      parsedCount < 1 ||
      parsedCount > maxQuestions
    ) {
      return t("invalidCount", { max: maxQuestions });
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const nextTopicError = validateTopic(topic);
    const nextCountError = type === "quiz" ? validateCount(count) : "";
    setTopicError(nextTopicError);
    setCountError(nextCountError);

    if (nextTopicError || nextCountError) return;

    const parsedCount = Number.parseInt(count, 10);

    startTransition(async () => {
      try {
        await generateContentWithAI({
          topic: topic.trim(),
          type,
          category,
          language,
          difficulty,
          count: parsedCount,
        });
      } catch (error: unknown) {
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );
      }
    });
  };

  if (settings.ai_enabled === "false") {
    return (
      <Card className="overflow-hidden border-dashed">
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Sparkles className="size-6" aria-hidden="true" />
          </div>
          <div className="flex max-w-md flex-col gap-2">
            <h3 className="text-xl font-semibold tracking-tight">
              {t("disabledTitle")}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("disabledDesc")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/70 bg-card/80 py-0 shadow-lg shadow-foreground/5 backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
      />

      <form onSubmit={handleSubmit} className="relative">
        <CardHeader className="border-b bg-muted/20 px-6 py-6 md:px-8">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <WandSparkles className="size-5" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{t("formTitle")}</CardTitle>
                <Badge variant="secondary">{t("aiBadge")}</Badge>
              </div>
              <CardDescription className="max-w-2xl leading-6">
                {t("formDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-7 md:px-8 md:py-8">
          <FieldGroup className="gap-7">
            {errorMsg ? (
              <Field data-invalid>
                <FieldError className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                  {errorMsg}
                </FieldError>
              </Field>
            ) : null}

            <div className="grid gap-5 md:grid-cols-3">
              <Field data-disabled={isPending || undefined}>
                <FieldLabel htmlFor="content-type">
                  {t("contentType")}
                </FieldLabel>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as "quiz" | "poll")}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="content-type"
                    className="w-full data-[size=default]:h-11"
                  >
                    <SelectValue placeholder={t("selectType")} />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      <SelectItem value="quiz">{t("quizType")}</SelectItem>
                      <SelectItem value="poll">{t("pollType")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field data-disabled={isPending || undefined}>
                <FieldLabel htmlFor="language">{t("language")}</FieldLabel>
                <Select
                  value={language}
                  onValueChange={(value) => value && setLanguage(value)}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="language"
                    className="w-full data-[size=default]:h-11"
                  >
                    <SelectValue placeholder={t("selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {languages.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field data-disabled={isPending || undefined}>
                <FieldLabel htmlFor="category">{t("category")}</FieldLabel>
                <Select
                  value={category}
                  onValueChange={(value) => value && setCategory(value)}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="category"
                    className="w-full data-[size=default]:h-11"
                  >
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field
              data-disabled={isPending || undefined}
              data-invalid={!!topicError || undefined}
            >
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="topic" className="text-base">
                  {t("topicLabel", { type: t(type) })}
                </FieldLabel>
                <FieldDescription>{t("topicHint")}</FieldDescription>
              </div>
              <Textarea
                id="topic"
                placeholder={t("topicPlaceholder")}
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (topicError) setTopicError(validateTopic(e.target.value));
                }}
                onBlur={() => setTopicError(validateTopic(topic))}
                className="min-h-36 resize-y bg-background/70 p-4 leading-6"
                disabled={isPending}
                minLength={3}
                maxLength={2000}
                aria-invalid={!!topicError}
                aria-describedby={topicError ? "topic-error" : undefined}
                required
              />
              {topicError ? (
                <FieldError id="topic-error">{topicError}</FieldError>
              ) : null}
            </Field>

            <div
              className={cn(
                "grid gap-5",
                type === "quiz" ? "md:grid-cols-2" : "md:max-w-md",
              )}
            >
              <Field data-disabled={isPending || undefined}>
                <FieldLabel htmlFor="difficulty">{t("difficulty")}</FieldLabel>
                <Select
                  value={difficulty}
                  onValueChange={(value) =>
                    setDifficulty(
                      value as "beginner" | "intermediate" | "advanced",
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="difficulty"
                    className="w-full data-[size=default]:h-11"
                  >
                    <SelectValue placeholder={t("selectDifficulty")} />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      <SelectItem value="beginner">{t("beginner")}</SelectItem>
                      <SelectItem value="intermediate">
                        {t("intermediate")}
                      </SelectItem>
                      <SelectItem value="advanced">{t("advanced")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {type === "quiz" ? (
                <Field
                  data-disabled={isPending || undefined}
                  data-invalid={!!countError || undefined}
                >
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel htmlFor="number-of-questions">
                      {t("numQuestions")}
                    </FieldLabel>
                    <Badge variant="outline">
                      {t("max", { max: maxQuestions })}
                    </Badge>
                  </div>
                  <Input
                    id="number-of-questions"
                    type="number"
                    min={1}
                    max={maxQuestions}
                    value={count}
                    onChange={(e) => {
                      setCount(e.target.value);
                      if (countError)
                        setCountError(validateCount(e.target.value));
                    }}
                    onBlur={() => setCountError(validateCount(count))}
                    placeholder={t("numPlaceholder")}
                    className="h-11"
                    disabled={isPending}
                    aria-invalid={!!countError}
                    aria-describedby={
                      countError ? "number-of-questions-error" : undefined
                    }
                    required
                  />
                  {countError ? (
                    <FieldError id="number-of-questions-error">
                      {countError}
                    </FieldError>
                  ) : null}
                </Field>
              ) : null}
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t bg-muted/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p className="text-sm text-muted-foreground">{t("generateHint")}</p>
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full px-7 sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Zap data-icon="inline-start" aria-hidden="true" />
            )}
            {isPending ? t("generating") : t("generate", { type: t(type) })}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
