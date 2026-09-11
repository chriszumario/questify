"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

// Fix: zod-v4-prefer-top-level-string-formats
interface RegisterFormProps {
  googleEnabled: boolean;
}

export function RegisterForm({ googleEnabled }: RegisterFormProps) {
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth.register");
  const tCommon = useTranslations("Auth");
  const registerSchema = z.object({
    name: z.string().trim().min(2, t("nameMin")),
    email: z.email(t("invalidEmail")).trim(),
    password: z.string().min(8, t("passwordMin")).max(128, t("passwordMax")),
  });

  const handleGoogleRegister = async () => {
    if (isGoogleLoading) return;

    setError("");
    setIsGoogleLoading(true);

    try {
      const { error: socialError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `/${locale}/dashboard`,
      });

      if (socialError) {
        setError(socialError.message ?? t("socialError"));
        setIsGoogleLoading(false);
      }
    } catch {
      setError(t("socialError"));
      setIsGoogleLoading(false);
    }
  };

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onChange({ value }) {
        const result = registerSchema.safeParse(value);
        return result.success ? undefined : t("fixErrors");
      },
    },
    onSubmit: async ({ value }) => {
      setError("");
      const result = registerSchema.safeParse(value);
      if (!result.success) {
        setError(t("fixErrors"));
        return;
      }
      const { error } = await authClient.signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        callbackURL: `/${locale}/dashboard`,
      });

      if (error) {
        setError(error.message || "Error creating account");
      } else {
        router.push("/dashboard");
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>
            {t(googleEnabled ? "subtitle" : "subtitleEmail")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {googleEnabled ? (
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={isGoogleLoading}
                  aria-busy={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  )}
                  {isGoogleLoading ? t("googleLoading") : t("googleBtn")}
                </Button>
              </div>
            ) : null}
            {googleEnabled ? (
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  {t("orContinue")}
                </span>
              </div>
            ) : null}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              noValidate
            >
              <FieldGroup>
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      registerSchema.shape.name.safeParse(value).error
                        ?.issues[0]?.message,
                  }}
                >
                  {(field) => {
                    const invalid = field.state.meta.errors.length > 0;
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>
                          {t("name")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="text"
                          placeholder={t("namePlaceholder")}
                          autoComplete="name"
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={invalid}
                          aria-describedby={
                            invalid ? `${field.name}-error` : undefined
                          }
                        />
                        <FieldError id={`${field.name}-error`}>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      registerSchema.shape.email.safeParse(value).error
                        ?.issues[0]?.message,
                  }}
                >
                  {(field) => {
                    const invalid = field.state.meta.errors.length > 0;
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>
                          {t("email")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          autoComplete="email"
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={invalid}
                          aria-describedby={
                            invalid ? `${field.name}-error` : undefined
                          }
                        />
                        <FieldError id={`${field.name}-error`}>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) =>
                      registerSchema.shape.password.safeParse(value).error
                        ?.issues[0]?.message,
                  }}
                >
                  {(field) => {
                    const invalid = field.state.meta.errors.length > 0;
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>
                          {t("password")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="password"
                          autoComplete="new-password"
                          minLength={8}
                          maxLength={128}
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={invalid}
                          aria-describedby={
                            invalid ? `${field.name}-error` : undefined
                          }
                        />
                        <FieldError id={`${field.name}-error`}>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      </Field>
                    );
                  }}
                </form.Field>

                {error ? (
                  <Field data-invalid>
                    <FieldError>{error}</FieldError>
                  </Field>
                ) : null}

                <form.Subscribe
                  selector={(state) =>
                    [state.canSubmit, state.isSubmitting] as const
                  }
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Spinner data-icon="inline-start" />
                      ) : null}
                      {isSubmitting ? t("submitting") : t("submit")}
                    </Button>
                  )}
                </form.Subscribe>
              </FieldGroup>
            </form>
            <div className="text-center text-sm">
              {t("hasAccount")}{" "}
              <Link href="/sign-in" className="underline underline-offset-4">
                {t("logInLink")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground">
        {tCommon("terms")} {tCommon("termsOfService")}
        {tCommon("and")}
        {tCommon("privacyPolicy")}
        {tCommon("period")}
      </div>
    </div>
  );
}
