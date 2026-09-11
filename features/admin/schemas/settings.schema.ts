import { z } from "zod";

const booleanSetting = z.enum(["true", "false"]);
const positiveIntegerSetting = z
  .string()
  .regex(/^\d+$/, "positiveInteger")
  .refine((value) => Number(value) > 0, "positiveInteger");

export const settingsSchema = z.object({
  ai_provider: z.enum(["gemini", "openai"]),
  ai_model: z
    .string()
    .trim()
    .min(1, "modelRequired")
    .max(100, "modelMaxLength"),
  ai_enabled: booleanSetting,
  ai_max_questions: positiveIntegerSetting.refine(
    (value) => Number(value) <= 100,
    "maxQuestionsRange",
  ),
  ai_daily_limit: positiveIntegerSetting.refine(
    (value) => Number(value) <= 1000,
    "dailyLimitRange",
  ),
  subscription_price_amount: z
    .string()
    .trim()
    .regex(/^\d+(?:\.\d{1,2})?$/, "priceInvalid")
    .refine((value) => Number(value) >= 0.5, "priceMinimum")
    .refine((value) => Number(value) <= 999999, "priceMaximum"),
  subscription_currency: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, "currencyInvalid"),
  subscription_interval: z.enum(["month", "year"]),
  polar_server: z.enum(["sandbox", "production"]),
  subscription_features: z
    .string()
    .trim()
    .min(1, "featuresRequired")
    .max(2000, "featuresMaxLength"),
});
