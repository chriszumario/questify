"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { PlusCircle, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  createPollSchema,
  pollOptionSchema,
} from "@/features/polls/schemas/poll.schema";
import { createPoll, updatePoll } from "@/features/polls/server/actions";
import type { PollOptionInput } from "@/features/polls/types";

interface PollData {
  id?: string;
  question: string;
  isPublished: boolean;
  options: PollOptionInput[];
}

interface CreatePollFormProps {
  initialData?: PollData;
}

type EditableOption = PollOptionInput & { clientKey: string };

interface PollErrors {
  question?: string;
  options?: string;
  optionByKey: Record<string, string>;
}

const EMPTY_ERRORS: PollErrors = { optionByKey: {} };

export function CreatePollForm({ initialData }: CreatePollFormProps) {
  const t = useTranslations("Polls.create");
  const isEditing = Boolean(initialData?.id);
  const [question, setQuestion] = React.useState(initialData?.question ?? "");
  const [isPublished, setIsPublished] = React.useState(
    initialData?.isPublished ?? true,
  );
  const [options, setOptions] = React.useState<EditableOption[]>(
    initialData?.options?.length
      ? initialData.options.map((option) => ({
          ...option,
          clientKey: option.id ?? crypto.randomUUID(),
        }))
      : [
          { clientKey: crypto.randomUUID(), text: "" },
          { clientKey: crypto.randomUUID(), text: "" },
        ],
  );
  const [isPending, startTransition] = React.useTransition();
  const [errors, setErrors] = React.useState<PollErrors>(EMPTY_ERRORS);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const translateIssue = (message: string) => t(`validation.${message}`);

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((current) => [
      ...current,
      { clientKey: crypto.randomUUID(), text: "" },
    ]);
    setErrors((current) => ({ ...current, options: undefined }));
  };

  const removeOption = (index: number) => {
    const removed = options[index];
    setOptions((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    setErrors((current) => {
      const optionByKey = { ...current.optionByKey };
      delete optionByKey[removed.clientKey];
      return { ...current, optionByKey };
    });
  };

  const updateOption = (index: number, text: string) => {
    const option = options[index];
    setOptions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, text } : item,
      ),
    );
    const issue =
      pollOptionSchema.shape.text.safeParse(text).error?.issues[0]?.message;
    setErrors((current) => ({
      ...current,
      options: undefined,
      optionByKey: {
        ...current.optionByKey,
        [option.clientKey]: issue ? translateIssue(issue) : "",
      },
    }));
  };

  const validate = () => {
    const payloadOptions = options
      .filter((option) => option.text.trim().length > 0)
      .map(({ id, text }) => ({ id, text }));
    const result = createPollSchema.safeParse({
      question,
      isPublished,
      options: payloadOptions,
    });

    if (result.success) {
      setErrors(EMPTY_ERRORS);
      return result.data;
    }

    const nextErrors: PollErrors = { optionByKey: {} };
    for (const issue of result.error.issues) {
      if (issue.path[0] === "question") {
        nextErrors.question = translateIssue(issue.message);
      } else if (issue.path[0] === "options") {
        nextErrors.options = translateIssue(issue.message);
      }
    }
    setErrors(nextErrors);
    return null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    const payload = validate();
    if (!payload) return;

    startTransition(async () => {
      try {
        if (isEditing && initialData?.id) {
          await updatePoll(initialData.id, payload);
        } else {
          await createPoll(payload);
        }
      } catch (error: unknown) {
        setSubmitError(
          error instanceof Error && !error.message.startsWith("[")
            ? error.message
            : t("saveError"),
        );
      }
    });
  };

  const questionInvalid = Boolean(errors.question);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="rounded-2xl border bg-card/40 p-6 shadow-lg backdrop-blur-xl md:p-8">
        <FieldGroup className="gap-8">
          <Field data-invalid={questionInvalid}>
            <FieldLabel htmlFor="question">{t("questionLabel")}</FieldLabel>
            <Input
              id="question"
              value={question}
              onChange={(event) => {
                const value = event.target.value;
                setQuestion(value);
                const issue =
                  createPollSchema.shape.question.safeParse(value).error
                    ?.issues[0]?.message;
                setErrors((current) => ({
                  ...current,
                  question: issue ? translateIssue(issue) : undefined,
                }));
              }}
              placeholder={t("questionPlaceholder")}
              maxLength={500}
              aria-invalid={questionInvalid}
              aria-describedby={questionInvalid ? "question-error" : undefined}
              className="h-11"
              required
            />
            {questionInvalid ? (
              <FieldError id="question-error">{errors.question}</FieldError>
            ) : null}
          </Field>

          <FieldSet>
            <FieldLegend>{t("optionsLabel")}</FieldLegend>
            <FieldGroup className="gap-3">
              {options.map((option, index) => {
                const optionError = errors.optionByKey[option.clientKey];
                const invalid = Boolean(optionError);
                const inputId = `poll-option-${option.clientKey}`;
                return (
                  <Field key={option.clientKey} data-invalid={invalid}>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <FieldLabel htmlFor={inputId} className="sr-only">
                        {t("optionPlaceholder", { number: index + 1 })}
                      </FieldLabel>
                      <Input
                        id={inputId}
                        value={option.text}
                        maxLength={200}
                        onChange={(event) =>
                          updateOption(index, event.target.value)
                        }
                        placeholder={t("optionPlaceholder", {
                          number: index + 1,
                        })}
                        aria-invalid={invalid}
                        aria-describedby={
                          invalid ? `${inputId}-error` : undefined
                        }
                        className="h-11"
                        required={index < 2}
                      />
                      {options.length > 2 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          aria-label={t("deleteOption", {
                            number: index + 1,
                          })}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                    {invalid ? (
                      <FieldError id={`${inputId}-error`}>
                        {optionError}
                      </FieldError>
                    ) : null}
                  </Field>
                );
              })}
              {errors.options ? (
                <Field data-invalid>
                  <FieldError>{errors.options}</FieldError>
                </Field>
              ) : null}
            </FieldGroup>
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              disabled={options.length >= 10}
            >
              <PlusCircle data-icon="inline-start" aria-hidden="true" />
              {t("addOption")}
            </Button>
          </FieldSet>

          <Field
            orientation="horizontal"
            className="rounded-xl border bg-muted/20 p-4"
          >
            <FieldContent>
              <FieldLabel htmlFor="publish-poll" className="text-base">
                {t("publishLabel")}
              </FieldLabel>
              <FieldDescription>{t("publishDesc")}</FieldDescription>
            </FieldContent>
            <Switch
              id="publish-poll"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </Field>
        </FieldGroup>
      </div>

      {submitError ? (
        <Field data-invalid>
          <FieldError>{submitError}</FieldError>
        </Field>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" aria-hidden="true" />
          )}
          {isEditing ? t("saveChanges") : t("createPoll")}
        </Button>
      </div>
    </form>
  );
}
