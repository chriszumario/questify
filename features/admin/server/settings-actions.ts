"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import type { AdminAppSettings } from "@/features/admin/server/settings";
import { settingsSchema } from "@/features/admin/schemas/settings.schema";
import { requireAdmin } from "@/lib/auth-session";
import { db } from "@/lib/db/drizzle";
import { appSettings } from "@/lib/db/schema";
import { provisionPolarProduct } from "@/lib/polar-service";

function requestOrigin(headerList: Headers) {
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) throw new Error("Unable to determine the application URL.");
  return `${protocol}://${host}`;
}

export async function updateAppSettings(data: AdminAppSettings) {
  await requireAdmin();
  const settings = settingsSchema.parse(data);
  const polar = await provisionPolarProduct(
    settings,
    requestOrigin(await headers()),
  );
  const persistedSettings: Record<string, string> = {
    ...settings,
    polar_product_id: polar.productId,
  };
  if (polar.webhook) {
    persistedSettings.polar_webhook_endpoint_id = polar.webhook.id;
    persistedSettings.polar_webhook_secret = polar.webhook.secret;
  }

  const values = Object.entries(persistedSettings).map(([key, value]) => ({
    key,
    value,
  }));

  await db
    .insert(appSettings)
    .values(values)
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: sql`excluded.value`, updatedAt: new Date() },
    });

  revalidatePath("/[locale]/dashboard/admin/settings", "page");
  revalidatePath("/[locale]/dashboard/ai", "page");
  revalidatePath("/[locale]/dashboard/billing", "page");

  return { success: true };
}
