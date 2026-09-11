"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

interface ProfileFormProps {
  user: { name: string; email: string };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations("UserSettings.profile");
  const [name, setName] = useState(user.name);
  const [nameTouched, setNameTouched] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const nameSchema = z
    .string()
    .trim()
    .min(1, t("nameRequired"))
    .min(2, t("nameMinLength"))
    .max(100, t("nameMaxLength"));
  const nameResult = nameSchema.safeParse(name);
  const nameError = nameResult.error?.issues[0]?.message;
  const nameInvalid = nameTouched && Boolean(nameError);

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setNameTouched(true);

    const result = nameSchema.safeParse(name);
    if (!result.success) return;

    setIsUpdatingName(true);
    try {
      const { error } = await authClient.updateUser({ name: result.data });
      if (error) {
        toast.error(error.message || t("updateError"));
      } else {
        setName(result.data);
        toast.success(t("success"));
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("updateError"));
    } finally {
      setIsUpdatingName(false);
    }
  };

  return (
    <form noValidate onSubmit={handleUpdateProfile}>
      <Card className="rounded-2xl border-border/70 bg-card/80 shadow-lg shadow-foreground/5">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-6 md:grid-cols-2">
            <Field data-disabled>
              <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
              <Input
                id="email"
                type="email"
                value={user.email}
                autoComplete="email"
                disabled
              />
              <FieldDescription>{t("emailDesc")}</FieldDescription>
            </Field>

            <Field data-invalid={nameInvalid}>
              <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
              <Input
                id="name"
                value={name}
                onBlur={() => setNameTouched(true)}
                onChange={(event) => setName(event.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                maxLength={100}
                aria-invalid={nameInvalid}
                aria-describedby={`name-description${nameInvalid ? " name-error" : ""}`}
                required
              />
              <FieldDescription id="name-description">
                {t("nameDesc")}
              </FieldDescription>
              {nameInvalid ? (
                <FieldError id="name-error">{nameError}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end bg-muted/20">
          <Button
            type="submit"
            size="lg"
            disabled={
              isUpdatingName ||
              !nameResult.success ||
              nameResult.data === user.name.trim()
            }
          >
            {isUpdatingName ? <Spinner data-icon="inline-start" /> : null}
            {t("save")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
