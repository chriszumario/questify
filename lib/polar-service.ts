import "server-only";

import { Polar } from "@polar-sh/sdk";
import type { PresentmentCurrency } from "@polar-sh/sdk/models/components/presentmentcurrency.js";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { and, eq, isNull, lte, or } from "drizzle-orm";

import { db } from "@/lib/db/drizzle";
import { appSettings, user } from "@/lib/db/schema";
import { polarAccessToken } from "@/lib/polar-config";

export type PolarServer = "sandbox" | "production";

const WEBHOOK_EVENTS = [
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
  "subscription.past_due",
] as const;

const CHECKOUT_SYNC_ATTEMPTS = 8;
const CHECKOUT_SYNC_DELAY_MS = 500;

export function getPolarClient(server: PolarServer) {
  if (!polarAccessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured.");
  }

  return new Polar({ accessToken: polarAccessToken, server });
}

export async function getPolarSettings() {
  const records = await db.select().from(appSettings);
  const settings = Object.fromEntries(
    records.map((record) => [record.key, record.value]),
  );

  return {
    server: (settings.polar_server === "sandbox"
      ? "sandbox"
      : "production") as PolarServer,
    productId: settings.polar_product_id,
    webhookEndpointId: settings.polar_webhook_endpoint_id,
    webhookSecret: settings.polar_webhook_secret,
  };
}

function grantsProAccess(status: Subscription["status"]) {
  return ["active", "trialing", "canceled", "past_due"].includes(status);
}

function isQuestifyProduct(subscription: Subscription, productId?: string) {
  return (
    subscription.productId === productId ||
    subscription.product.metadata.questifyPlan === "pro"
  );
}

export async function syncPolarSubscription(
  subscription: Subscription,
  eventTimestamp = new Date(),
) {
  const userId = subscription.customer.externalId;
  const { productId } = await getPolarSettings();
  if (!userId || !isQuestifyProduct(subscription, productId)) return;

  await db
    .update(user)
    .set({
      plan: grantsProAccess(subscription.status) ? "pro" : "free",
      polarSubscriptionId: subscription.id,
      subscriptionStatus: subscription.cancelAtPeriodEnd
        ? "canceling"
        : subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      subscriptionEventAt: eventTimestamp,
    })
    .where(
      and(
        eq(user.id, userId),
        or(
          isNull(user.subscriptionEventAt),
          lte(user.subscriptionEventAt, eventTimestamp),
        ),
      ),
    );
}

export async function revokePolarSubscription(
  subscription: Subscription,
  eventTimestamp = new Date(),
) {
  const userId = subscription.customer.externalId;
  if (!userId) return;

  await db
    .update(user)
    .set({
      plan: "free",
      subscriptionStatus: subscription.status,
      currentPeriodEnd: null,
      subscriptionEventAt: eventTimestamp,
    })
    .where(
      and(
        eq(user.id, userId),
        eq(user.polarSubscriptionId, subscription.id),
        or(
          isNull(user.subscriptionEventAt),
          lte(user.subscriptionEventAt, eventTimestamp),
        ),
      ),
    );
}

export async function syncCheckout(checkoutId: string, userId: string) {
  const settings = await getPolarSettings();
  const client = getPolarClient(settings.server);
  const checkout = await client.checkouts.get({ id: checkoutId });

  if (checkout.externalCustomerId !== userId) {
    throw new Error("The Polar checkout does not belong to this user.");
  }

  if (!checkout.subscriptionId) {
    return false;
  }

  const subscription = await client.subscriptions.get({
    id: checkout.subscriptionId,
  });
  await syncPolarSubscription(subscription);
  return true;
}

export async function syncCheckoutWithRetry(
  checkoutId: string,
  userId: string,
) {
  for (let attempt = 0; attempt < CHECKOUT_SYNC_ATTEMPTS; attempt += 1) {
    if (await syncCheckout(checkoutId, userId)) return true;

    if (attempt < CHECKOUT_SYNC_ATTEMPTS - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, CHECKOUT_SYNC_DELAY_MS),
      );
    }
  }

  // Polar can create the subscription just after the checkout response. A final
  // lookup by the authenticated user's external ID covers that short delay.
  const settings = await getPolarSettings();
  const subscription = await findActivePolarSubscription(userId, settings.server);
  if (!subscription) return false;

  await syncPolarSubscription(subscription);
  return true;
}

export async function configurePolarWebhook(client: Polar, webhookUrl: string) {
  const current = await getPolarSettings();
  let endpoint;

  if (current.webhookEndpointId) {
    try {
      endpoint = await client.webhooks.updateWebhookEndpoint({
        id: current.webhookEndpointId,
        webhookEndpointUpdate: {
          url: webhookUrl,
          name: "Questify subscriptions",
          format: "raw",
          events: [...WEBHOOK_EVENTS],
          enabled: true,
        },
      });
    } catch {
      endpoint = undefined;
    }
  }

  if (!endpoint) {
    const pages = await client.webhooks.listWebhookEndpoints({ limit: 100 });
    for await (const page of pages) {
      endpoint = page.result.items.find((item) => item.url === webhookUrl);
      if (endpoint) break;
    }

    if (endpoint) {
      endpoint = await client.webhooks.updateWebhookEndpoint({
        id: endpoint.id,
        webhookEndpointUpdate: {
          name: "Questify subscriptions",
          format: "raw",
          events: [...WEBHOOK_EVENTS],
          enabled: true,
        },
      });
    }
  }

  if (!endpoint) {
    endpoint = await client.webhooks.createWebhookEndpoint({
      url: webhookUrl,
      name: "Questify subscriptions",
      format: "raw",
      events: [...WEBHOOK_EVENTS],
    });
  }

  return { id: endpoint.id, secret: endpoint.secret };
}

export interface PolarProductSettings {
  subscription_price_amount: string;
  subscription_currency: string;
  subscription_interval: "month" | "year";
  subscription_features: string;
  polar_server: PolarServer;
}

export async function provisionPolarProduct(
  settings: PolarProductSettings,
  origin: string,
) {
  const current = await getPolarSettings();
  const client = getPolarClient(settings.polar_server);
  const price = {
    amountType: "fixed" as const,
    priceAmount: Math.round(Number(settings.subscription_price_amount) * 100),
    priceCurrency:
      settings.subscription_currency.toLowerCase() as PresentmentCurrency,
  };
  const productData = {
    name: "Questify Pro",
    description: settings.subscription_features
      .split("\n")
      .filter(Boolean)
      .join(" · "),
    metadata: { questifyPlan: "pro" },
    visibility: "public" as const,
    prices: [price],
  };

  let productId: string | undefined;
  let productToArchive: string | undefined;
  if (current.productId && current.server === settings.polar_server) {
    let existing;
    try {
      existing = await client.products.get({ id: current.productId });
    } catch {
      existing = undefined;
    }

    if (existing) {
      if (existing.recurringInterval === settings.subscription_interval) {
        const product = await client.products.update({
          id: existing.id,
          productUpdate: productData,
        });
        productId = product.id;
      } else {
        productToArchive = existing.id;
      }
    }
  }

  if (!productId) {
    const product = await client.products.create({
      ...productData,
      recurringInterval: settings.subscription_interval,
    });
    productId = product.id;

    if (productToArchive) {
      try {
        await client.products.update({
          id: productToArchive,
          productUpdate: { isArchived: true },
        });
      } catch (error) {
        console.error("Unable to archive the previous Polar product", error);
      }
    }
  }

  const isPublicOrigin = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    origin,
  );
  const webhook = isPublicOrigin
    ? await configurePolarWebhook(client, `${origin}/api/polar/webhooks`)
    : null;

  return { productId, webhook };
}

export async function findActivePolarSubscription(
  userId: string,
  server: PolarServer,
) {
  const pages = await getPolarClient(server).subscriptions.list({
    externalCustomerId: userId,
    status: ["active", "trialing", "past_due", "canceled"],
    limit: 20,
  });
  const { productId } = await getPolarSettings();

  for await (const page of pages) {
    const subscription = page.result.items.find((item) =>
      isQuestifyProduct(item, productId),
    );
    if (subscription) return subscription;
  }

  return null;
}
