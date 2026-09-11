"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Cpu, CreditCard, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { settingsSchema } from "@/features/admin/schemas/settings.schema";
import { updateAppSettings } from "@/features/admin/server/settings-actions";
import type { AdminAppSettings } from "@/features/admin/server/settings";

interface PlatformSettingsFormProps {
  initialSettings: AdminAppSettings;
}
type FieldErrors = Partial<Record<keyof AdminAppSettings, string>>;

export function PlatformSettingsForm({
  initialSettings,
}: PlatformSettingsFormProps) {
  const t = useTranslations("Settings");
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState(initialSettings);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [activeTab, setActiveTab] = useState("ai");

  const translateIssue = (message: string) =>
    t(`validation.${message}` as Parameters<typeof t>[0]);

  const validate = (value: AdminAppSettings) => {
    const result = settingsSchema.safeParse(value);
    if (result.success) {
      setFieldErrors({});
      return result.data;
    }

    const nextErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof AdminAppSettings | undefined;
      if (field && !nextErrors[field])
        nextErrors[field] = translateIssue(issue.message);
    }
    setFieldErrors(nextErrors);
    return null;
  };

  const validateField = (
    value: AdminAppSettings,
    field: keyof AdminAppSettings,
  ) => {
    const result = settingsSchema.safeParse(value);
    const issue = result.success
      ? undefined
      : result.error.issues.find((item) => item.path[0] === field);

    setFieldErrors((current) => ({
      ...current,
      [field]: issue ? translateIssue(issue.message) : undefined,
    }));
  };

  const updateSetting = <Key extends keyof AdminAppSettings>(
    key: Key,
    value: AdminAppSettings[Key],
  ) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    if (fieldErrors[key]) validateField(nextSettings, key);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validSettings = validate(settings);
    if (!validSettings) {
      const aiResult = settingsSchema.safeParse(settings);
      const firstInvalidField = aiResult.success
        ? undefined
        : aiResult.error.issues[0]?.path[0];
      if (
        firstInvalidField === "subscription_price_amount" ||
        firstInvalidField === "subscription_currency" ||
        firstInvalidField === "subscription_interval" ||
        firstInvalidField === "polar_server" ||
        firstInvalidField === "subscription_features"
      ) {
        setActiveTab("payments");
      } else {
        setActiveTab("ai");
      }
      toast.error(t("validation.fixErrors"));
      return;
    }

    startTransition(async () => {
      try {
        await updateAppSettings(validSettings);
        setSettings(validSettings);
        toast.success(t("saved"));
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : t("saveError"));
      }
    });
  };

  const errorProps = (field: keyof AdminAppSettings, id: string) => ({
    "aria-invalid": !!fieldErrors[field],
    "aria-describedby": fieldErrors[field] ? id : undefined,
  });

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6" noValidate>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-10 w-full max-w-125 grid-cols-2 rounded-xl p-1">
          <TabsTrigger value="ai" className="gap-2 px-4">
            <Cpu className="size-4" aria-hidden="true" />
            {t("aiTab")}
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 px-4">
            <CreditCard className="size-4" aria-hidden="true" />
            {t("paymentsTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 shadow-lg shadow-foreground/5">
            <CardHeader>
              <CardTitle>{t("aiConfigTitle")}</CardTitle>
              <CardDescription>{t("aiConfigDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-6">
                <Field
                  orientation="horizontal"
                  className="rounded-xl border bg-muted/40 p-4"
                >
                  <FieldContent>
                    <FieldLabel htmlFor="ai-enabled" className="text-base">
                      {t("enableAI")}
                    </FieldLabel>
                    <FieldDescription>{t("enableAIDesc")}</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="ai-enabled"
                    checked={settings.ai_enabled === "true"}
                    onCheckedChange={(checked) =>
                      updateSetting("ai_enabled", checked ? "true" : "false")
                    }
                    disabled={isPending}
                  />
                </Field>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field data-disabled={isPending || undefined}>
                    <FieldLabel htmlFor="ai-provider">
                      {t("aiProvider")}
                    </FieldLabel>
                    <Select
                      value={settings.ai_provider}
                      onValueChange={(value) =>
                        value && updateSetting("ai_provider", value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger id="ai-provider" className="w-full">
                        <SelectValue placeholder={t("selectProvider")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field data-invalid={!!fieldErrors.ai_model || undefined}>
                    <FieldLabel htmlFor="ai-model">{t("aiModel")}</FieldLabel>
                    <Input
                      id="ai-model"
                      value={settings.ai_model}
                      onChange={(event) =>
                        updateSetting("ai_model", event.target.value)
                      }
                      onBlur={() => validateField(settings, "ai_model")}
                      placeholder={t("modelPlaceholder")}
                      disabled={isPending}
                      maxLength={100}
                      {...errorProps("ai_model", "ai-model-error")}
                    />
                    {fieldErrors.ai_model ? (
                      <FieldError id="ai-model-error">
                        {fieldErrors.ai_model}
                      </FieldError>
                    ) : null}
                  </Field>

                  <Field
                    data-invalid={!!fieldErrors.ai_max_questions || undefined}
                  >
                    <FieldLabel htmlFor="ai-max-questions">
                      {t("maxQuestions")}
                    </FieldLabel>
                    <Input
                      id="ai-max-questions"
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      value={settings.ai_max_questions}
                      onChange={(event) =>
                        updateSetting("ai_max_questions", event.target.value)
                      }
                      onBlur={() => validateField(settings, "ai_max_questions")}
                      disabled={isPending}
                      {...errorProps(
                        "ai_max_questions",
                        "ai-max-questions-error",
                      )}
                    />
                    <FieldDescription>{t("maxQuestionsDesc")}</FieldDescription>
                    {fieldErrors.ai_max_questions ? (
                      <FieldError id="ai-max-questions-error">
                        {fieldErrors.ai_max_questions}
                      </FieldError>
                    ) : null}
                  </Field>

                  <Field
                    data-invalid={!!fieldErrors.ai_daily_limit || undefined}
                  >
                    <FieldLabel htmlFor="ai-daily-limit">
                      {t("dailyLimit")}
                    </FieldLabel>
                    <Input
                      id="ai-daily-limit"
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      value={settings.ai_daily_limit}
                      onChange={(event) =>
                        updateSetting("ai_daily_limit", event.target.value)
                      }
                      onBlur={() => validateField(settings, "ai_daily_limit")}
                      disabled={isPending}
                      {...errorProps("ai_daily_limit", "ai-daily-limit-error")}
                    />
                    <FieldDescription>{t("dailyLimitDesc")}</FieldDescription>
                    {fieldErrors.ai_daily_limit ? (
                      <FieldError id="ai-daily-limit-error">
                        {fieldErrors.ai_daily_limit}
                      </FieldError>
                    ) : null}
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card className="rounded-2xl border-border/70 bg-card/80 shadow-lg shadow-foreground/5">
            <CardHeader>
              <CardTitle>{t("paymentsTitle")}</CardTitle>
              <CardDescription>{t("paymentsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-6">
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-medium">{t("pricingTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("pricingDesc")}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    data-invalid={
                      !!fieldErrors.subscription_price_amount || undefined
                    }
                  >
                    <FieldLabel htmlFor="price-amount">
                      {t("priceAmount")}
                    </FieldLabel>
                    <Input
                      id="price-amount"
                      type="number"
                      min="0.50"
                      step="0.01"
                      value={settings.subscription_price_amount}
                      onChange={(event) =>
                        updateSetting(
                          "subscription_price_amount",
                          event.target.value,
                        )
                      }
                      onBlur={() =>
                        validateField(settings, "subscription_price_amount")
                      }
                      placeholder={t("pricePlaceholder")}
                      disabled={isPending}
                      {...errorProps(
                        "subscription_price_amount",
                        "price-amount-error",
                      )}
                    />
                    {fieldErrors.subscription_price_amount ? (
                      <FieldError id="price-amount-error">
                        {fieldErrors.subscription_price_amount}
                      </FieldError>
                    ) : null}
                  </Field>

                  <Field
                    data-invalid={
                      !!fieldErrors.subscription_currency || undefined
                    }
                  >
                    <FieldLabel htmlFor="subscription-currency">
                      {t("currency")}
                    </FieldLabel>
                    <Input
                      id="subscription-currency"
                      value={settings.subscription_currency}
                      onChange={(event) =>
                        updateSetting(
                          "subscription_currency",
                          event.target.value.toUpperCase(),
                        )
                      }
                      onBlur={() =>
                        validateField(settings, "subscription_currency")
                      }
                      placeholder="USD"
                      disabled={isPending}
                      maxLength={3}
                      {...errorProps("subscription_currency", "currency-error")}
                    />
                    {fieldErrors.subscription_currency ? (
                      <FieldError id="currency-error">
                        {fieldErrors.subscription_currency}
                      </FieldError>
                    ) : null}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="subscription-interval">
                      {t("billingInterval")}
                    </FieldLabel>
                    <Select
                      value={settings.subscription_interval}
                      onValueChange={(value) =>
                        value && updateSetting("subscription_interval", value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="subscription-interval"
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">{t("monthly")}</SelectItem>
                        <SelectItem value="year">{t("yearly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="polar-server">
                      {t("polarEnvironment")}
                    </FieldLabel>
                    <Select
                      value={settings.polar_server}
                      onValueChange={(value) =>
                        value && updateSetting("polar_server", value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger id="polar-server" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">
                          {t("production")}
                        </SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      {t("polarEnvironmentDesc")}
                    </FieldDescription>
                  </Field>
                </div>

                <Field
                  data-invalid={
                    !!fieldErrors.subscription_features || undefined
                  }
                >
                  <FieldLabel htmlFor="subscription-features">
                    {t("proFeatures")}
                  </FieldLabel>
                  <Textarea
                    id="subscription-features"
                    className="min-h-30 resize-y"
                    placeholder={t("proPlaceholder")}
                    value={settings.subscription_features}
                    onChange={(event) =>
                      updateSetting("subscription_features", event.target.value)
                    }
                    onBlur={() =>
                      validateField(settings, "subscription_features")
                    }
                    disabled={isPending}
                    maxLength={2000}
                    {...errorProps(
                      "subscription_features",
                      "subscription-features-error",
                    )}
                  />
                  <FieldDescription>{t("proDesc")}</FieldDescription>
                  {fieldErrors.subscription_features ? (
                    <FieldError id="subscription-features-error">
                      {fieldErrors.subscription_features}
                    </FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" aria-hidden="true" />
          )}
          {t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
