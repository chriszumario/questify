"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth-session";
import {
  findActivePolarSubscription,
  getPolarClient,
  getPolarSettings,
  syncPolarSubscription,
} from "@/lib/polar-service";

const localeSchema = z.enum(["en", "es"]);

function requestOrigin(headerList: Headers) {
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) throw new Error("Unable to determine the application URL.");
  return `${protocol}://${host}`;
}

export async function createPolarCheckout(locale: string) {
  const currentUser = await requireUser();
  const parsedLocale = localeSchema.parse(locale);
  const settings = await getPolarSettings();
  if (!settings.productId) {
    throw new Error("The subscription product has not been configured yet.");
  }

  const activeSubscription = await findActivePolarSubscription(
    currentUser.id,
    settings.server,
  );
  if (activeSubscription) {
    await syncPolarSubscription(activeSubscription);
    revalidatePath("/[locale]/dashboard/billing", "page");
    throw new Error("You already have an active Polar subscription.");
  }

  const origin = requestOrigin(await headers());
  const billingUrl = `${origin}/${parsedLocale}/dashboard/billing`;
  const successUrl = `${origin}/api/polar/checkout/success?locale=${parsedLocale}&checkout_id={CHECKOUT_ID}`;
  const checkout = await getPolarClient(settings.server).checkouts.create({
    products: [settings.productId],
    externalCustomerId: currentUser.id,
    customerEmail: currentUser.email,
    customerName: currentUser.name,
    locale: parsedLocale,
    successUrl,
    returnUrl: billingUrl,
    metadata: { questifyUserId: currentUser.id },
  });

  return { url: checkout.url };
}

export async function setPolarSubscriptionCancellation(cancel: boolean) {
  const currentUser = await requireUser();
  const shouldCancel = z.boolean().parse(cancel);
  if (!currentUser.polarSubscriptionId) {
    throw new Error("No active Polar subscription was found.");
  }

  const settings = await getPolarSettings();
  const client = getPolarClient(settings.server);
  const existing = await client.subscriptions.get({
    id: currentUser.polarSubscriptionId,
  });
  if (existing.customer.externalId !== currentUser.id) {
    throw new Error("This subscription does not belong to the current user.");
  }

  const subscription = await client.subscriptions.update({
    id: existing.id,
    subscriptionUpdate: { cancelAtPeriodEnd: shouldCancel },
  });
  await syncPolarSubscription(subscription);
  revalidatePath("/[locale]/dashboard/billing", "page");

  return { cancelAtPeriodEnd: subscription.cancelAtPeriodEnd };
}
