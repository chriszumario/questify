import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";

import {
  getPolarSettings,
  revokePolarSubscription,
  syncPolarSubscription,
} from "@/lib/polar-service";

export async function POST(request: Request) {
  const { webhookSecret } = await getPolarSettings();
  if (!webhookSecret) {
    return Response.json(
      { error: "Webhook is not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await request.text();
    const event = validateEvent(
      body,
      Object.fromEntries(request.headers.entries()),
      webhookSecret,
    );
    const timestampHeader = request.headers.get("webhook-timestamp");
    const eventTimestamp = timestampHeader
      ? new Date(Number(timestampHeader) * 1000)
      : new Date();

    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.canceled":
      case "subscription.uncanceled":
      case "subscription.past_due":
        await syncPolarSubscription(event.data, eventTimestamp);
        break;
      case "subscription.revoked":
        await revokePolarSubscription(event.data, eventTimestamp);
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return Response.json({ error: "Invalid signature" }, { status: 403 });
    }

    console.error("Polar webhook processing failed", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }
}
