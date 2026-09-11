import "server-only";

import { db } from "@/lib/db/drizzle";
import { appSettings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-session";

export interface PublicAppSettings {
  ai_enabled: string;
  ai_max_questions: string;
  subscription_price_amount: string;
  subscription_currency: string;
  subscription_interval: "month" | "year";
  subscription_features: string;
}

export interface AdminAppSettings extends PublicAppSettings {
  ai_provider: string;
  ai_model: string;
  ai_daily_limit: string;
  polar_server: "sandbox" | "production";
}

const DEFAULT_FEATURES = [
  "Unlimited Quizzes & Polls",
  "Unlimited AI Generation",
  "Advanced Analytics",
  "Custom Branding",
  "Priority Support",
].join("\n");

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function getSettingsMap() {
  const records = await db.select().from(appSettings);
  return Object.fromEntries(
    records.map((record) => [record.key, record.value]),
  );
}

function toPublicSettings(settings: Record<string, string>): PublicAppSettings {
  return {
    ai_enabled: settings.ai_enabled ?? "true",
    ai_max_questions: settings.ai_max_questions || "20",
    subscription_price_amount: settings.subscription_price_amount ?? "9.99",
    subscription_currency: settings.subscription_currency ?? "USD",
    subscription_interval:
      settings.subscription_interval === "year" ? "year" : "month",
    subscription_features: settings.subscription_features ?? DEFAULT_FEATURES,
  };
}

export async function getPublicAppSettings(): Promise<PublicAppSettings> {
  return toPublicSettings(await getSettingsMap());
}

export async function getAdminAppSettings(): Promise<AdminAppSettings> {
  await requireAdmin();
  const settings = await getSettingsMap();

  return {
    ...toPublicSettings(settings),
    ai_provider: settings.ai_provider || "gemini",
    ai_model: settings.ai_model || "gemini-1.5-flash",
    ai_daily_limit: settings.ai_daily_limit || "10",
    polar_server:
      settings.polar_server === "sandbox" ? "sandbox" : "production",
  };
}

export async function getAISettings() {
  const settings = await getSettingsMap();
  return {
    enabled: settings.ai_enabled !== "false",
    provider:
      settings.ai_provider === "openai"
        ? ("openai" as const)
        : ("gemini" as const),
    model: settings.ai_model || "gemini-1.5-flash",
    maxQuestions: positiveInteger(settings.ai_max_questions, 20),
    dailyLimit: positiveInteger(settings.ai_daily_limit, 10),
  };
}
