import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db/drizzle";
import { googleAuthConfig } from "./auth-config";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  account: {
    identityStrategy: "provider-id",
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  socialProviders: googleAuthConfig,
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      plan: {
        type: "string",
        defaultValue: "free",
      },
      polarSubscriptionId: {
        type: "string",
        required: false,
      },
      subscriptionStatus: {
        type: "string",
        required: false,
      },
      currentPeriodEnd: {
        type: "number",
        required: false,
      },
    },
  },
});
