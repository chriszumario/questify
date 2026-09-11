import { z } from "zod";

import { auth } from "@/lib/auth";
import { syncCheckoutWithRetry } from "@/lib/polar-service";

const callbackSchema = z.object({
  checkoutId: z.string().uuid(),
  locale: z.enum(["en", "es"]),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callback = callbackSchema.safeParse({
    checkoutId: url.searchParams.get("checkout_id"),
    locale: url.searchParams.get("locale"),
  });

  if (!callback.success) {
    return Response.json({ error: "Invalid checkout callback" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.redirect(new URL(`/${callback.data.locale}/sign-in`, url));
  }

  const billingUrl = new URL(
    `/${callback.data.locale}/dashboard/billing`,
    url,
  );
  billingUrl.searchParams.set("checkout_id", callback.data.checkoutId);

  try {
    const synchronized = await syncCheckoutWithRetry(
      callback.data.checkoutId,
      session.user.id,
    );
    billingUrl.searchParams.set(
      synchronized ? "success" : "sync_pending",
      "true",
    );
  } catch (error) {
    console.error("Unable to synchronize the completed Polar checkout", error);
    billingUrl.searchParams.set("sync_error", "true");
  }

  return Response.redirect(billingUrl);
}
