"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

interface SecurityFormProps {
  isOAuthOnly: boolean;
}

export function SecurityForm({ isOAuthOnly }: SecurityFormProps) {
  const t = useTranslations("UserSettings.security");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [touched, setTouched] = useState({ current: false, next: false });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, t("currentPassRequired")),
      newPassword: z
        .string()
        .min(1, t("newPassRequired"))
        .min(8, t("newPassMinLength"))
        .max(128, t("newPassMaxLength")),
    })
    .refine((value) => value.currentPassword !== value.newPassword, {
      message: t("passwordsMustDiffer"),
      path: ["newPassword"],
    });
  const passwordResult = passwordSchema.safeParse({
    currentPassword,
    newPassword,
  });
  const currentError = passwordResult.error?.issues.find(
    (issue) => issue.path[0] === "currentPassword",
  )?.message;
  const newError = passwordResult.error?.issues.find(
    (issue) => issue.path[0] === "newPassword",
  )?.message;
  const currentInvalid = touched.current && Boolean(currentError);
  const newInvalid = touched.next && Boolean(newError);

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ current: true, next: true });

    const result = passwordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) return;

    setIsUpdatingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        ...result.data,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message || t("updateError"));
      } else {
        toast.success(t("success"));
        setCurrentPassword("");
        setNewPassword("");
        setTouched({ current: false, next: false });
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("updateError"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isOAuthOnly) {
    return (
      <Card className="rounded-2xl border-border/70 bg-card/80 shadow-lg shadow-foreground/5">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal" className="justify-center py-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </div>
            <FieldContent className="max-w-sm">
              <FieldTitle>{t("managedByGoogle")}</FieldTitle>
              <FieldDescription>{t("managedByGoogleDesc")}</FieldDescription>
            </FieldContent>
          </Field>
        </CardContent>
      </Card>
    );
  }

  return (
    <form noValidate onSubmit={handleUpdatePassword}>
      <Card className="rounded-2xl border-border/70 bg-card/80 shadow-lg shadow-foreground/5">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-6 md:grid-cols-2">
            <Field data-invalid={currentInvalid}>
              <FieldLabel htmlFor="currentPassword">
                {t("currentPass")}
              </FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onBlur={() =>
                  setTouched((value) => ({ ...value, current: true }))
                }
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                aria-invalid={currentInvalid}
                aria-describedby={
                  currentInvalid ? "current-password-error" : undefined
                }
                required
              />
              {currentInvalid ? (
                <FieldError id="current-password-error">
                  {currentError}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={newInvalid}>
              <FieldLabel htmlFor="newPassword">{t("newPass")}</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onBlur={() => setTouched((value) => ({ ...value, next: true }))}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                aria-invalid={newInvalid}
                aria-describedby={`new-password-description${newInvalid ? " new-password-error" : ""}`}
                required
              />
              <FieldDescription id="new-password-description">
                {t("newPassDesc")}
              </FieldDescription>
              {newInvalid ? (
                <FieldError id="new-password-error">{newError}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end bg-muted/20">
          <Button
            type="submit"
            size="lg"
            disabled={isUpdatingPassword || !passwordResult.success}
          >
            {isUpdatingPassword ? <Spinner data-icon="inline-start" /> : null}
            {t("updatePass")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
