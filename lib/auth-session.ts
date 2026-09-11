import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";

export const getSession = cache(async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return session;

  const [currentUser] = await db
    .select({
      role: user.role,
      plan: user.plan,
      polarSubscriptionId: user.polarSubscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser) return session;

  return {
    ...session,
    user: {
      ...session.user,
      ...currentUser,
      currentPeriodEnd: currentUser.currentPeriodEnd?.getTime() ?? null,
    },
  };
});

export async function requireUser() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return user;
}
