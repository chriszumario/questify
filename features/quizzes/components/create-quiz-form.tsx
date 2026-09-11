"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createQuizSchema } from "@/features/quizzes/schemas/quiz.schema";
import {
  createQuiz,
  updateQuizSettings,
} from "@/features/quizzes/server/actions";
import { Link } from "@/i18n/routing";

interface CreateQuizFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    timeLimit: number | null;
    requireAuth?: boolean;
    maxAttempts?: number | null;
  };
  onSuccess?: () => void;
}

function fieldErrors(errors: unknown[]) {
  return errors.map((error) => ({ message: String(error) }));
}

export function CreateQuizForm({
  initialData,
  onSuccess,
}: CreateQuizFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(initialData?.id);
  const t = useTranslations("Quizzes.create");

  const translateIssue = (message?: string) =>
    message ? t(`validation.${message}`) : undefined;

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      timeLimitMinutes: initialData?.timeLimit
        ? Math.ceil(initialData.timeLimit / 60)
        : undefined,
      requireAuth: initialData?.requireAuth ?? false,
      maxAttempts: initialData?.maxAttempts ?? 1,
    },
    validators: {
      onChange: ({ value }) =>
        createQuizSchema.safeParse({ ...value, isPublished: false }).success
          ? undefined
          : t("validation.fixErrors"),
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const result = createQuizSchema.safeParse({
        ...value,
        isPublished: false,
      });

      if (!result.success) {
        setSubmitError(t("validation.fixErrors"));
        return;
      }

      try {
        if (isEditing && initialData?.id) {
          await updateQuizSettings(initialData.id, result.data);
          onSuccess?.();
        } else {
          await createQuiz(result.data);
        }
      } catch (error: unknown) {
        setSubmitError(
          error instanceof Error && !error.message.startsWith("[")
            ? error.message
            : t("saveError"),
        );
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className={
        isEditing
          ? "flex flex-col gap-6"
          : "flex w-full flex-col gap-8 rounded-2xl border bg-card/40 p-6 shadow-lg backdrop-blur-md md:p-8"
      }
    >
      <FieldGroup className="gap-6">
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => {
              const issue =
                createQuizSchema.shape.title.safeParse(value).error?.issues[0]
                  ?.message;
              return translateIssue(issue);
            },
          }}
        >
          {(field) => {
            const invalid = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("quizTitleLabel")}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={t("quizTitlePlaceholder")}
                  maxLength={100}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `${field.name}-error` : undefined}
                  className="h-11"
                  required
                />
                <FieldError
                  id={`${field.name}-error`}
                  errors={fieldErrors(field.state.meta.errors)}
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field
          name="description"
          validators={{
            onChange: ({ value }) => {
              const issue =
                createQuizSchema.shape.description.safeParse(value).error
                  ?.issues[0]?.message;
              return translateIssue(issue);
            },
          }}
        >
          {(field) => {
            const invalid = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("descriptionLabel")}
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  rows={4}
                  maxLength={500}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `${field.name}-error` : undefined}
                  className="resize-y"
                />
                <FieldDescription>
                  {field.state.value.length}/500
                </FieldDescription>
                <FieldError
                  id={`${field.name}-error`}
                  errors={fieldErrors(field.state.meta.errors)}
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field
          name="timeLimitMinutes"
          validators={{
            onChange: ({ value }) => {
              const issue =
                createQuizSchema.shape.timeLimitMinutes.safeParse(value).error
                  ?.issues[0]?.message;
              return translateIssue(issue);
            },
          }}
        >
          {(field) => {
            const invalid = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("timeLimitLabel")}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={1}
                  step={1}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value
                        ? Number.parseInt(event.target.value, 10)
                        : undefined,
                    )
                  }
                  placeholder={t("timeLimitPlaceholder")}
                  aria-invalid={invalid}
                  aria-describedby={`${field.name}-description${invalid ? ` ${field.name}-error` : ""}`}
                  className="h-11"
                />
                <FieldDescription id={`${field.name}-description`}>
                  {t("timeLimitDesc")}
                </FieldDescription>
                <FieldError
                  id={`${field.name}-error`}
                  errors={fieldErrors(field.state.meta.errors)}
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="requireAuth">
          {(field) => (
            <Field
              orientation="horizontal"
              className="rounded-xl border bg-muted/20 p-4"
            >
              <FieldContent>
                <FieldLabel htmlFor={field.name} className="text-base">
                  {t("requireAuthLabel")}
                </FieldLabel>
                <FieldDescription>{t("requireAuthDesc")}</FieldDescription>
              </FieldContent>
              <Switch
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
            </Field>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.requireAuth}>
          {(requireAuth) =>
            requireAuth ? (
              <form.Field
                name="maxAttempts"
                validators={{
                  onChange: ({ value }) => {
                    const issue =
                      createQuizSchema.shape.maxAttempts.safeParse(value).error
                        ?.issues[0]?.message;
                    return translateIssue(issue);
                  },
                }}
              >
                {(field) => {
                  const invalid = field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("maxAttemptsLabel")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={1}
                        step={1}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                              ? Number.parseInt(event.target.value, 10)
                              : 1,
                          )
                        }
                        placeholder={t("maxAttemptsPlaceholder")}
                        aria-invalid={invalid}
                        aria-describedby={`${field.name}-description${invalid ? ` ${field.name}-error` : ""}`}
                        className="h-11"
                        required
                      />
                      <FieldDescription id={`${field.name}-description`}>
                        {t("maxAttemptsDesc")}
                      </FieldDescription>
                      <FieldError
                        id={`${field.name}-error`}
                        errors={fieldErrors(field.state.meta.errors)}
                      />
                    </Field>
                  );
                }}
              </form.Field>
            ) : null
          }
        </form.Subscribe>
      </FieldGroup>

      {submitError ? (
        <Field data-invalid>
          <FieldError>{submitError}</FieldError>
        </Field>
      ) : null}

      <Separator />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {!isEditing ? (
          <Link
            href="/dashboard/quizzes"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("cancel")}
          </Link>
        ) : null}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isEditing ? t("saveSettings") : t("createQuiz")}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
