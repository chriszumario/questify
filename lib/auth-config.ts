import "server-only";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const googleAuthConfig = clientId && clientSecret
  ? { google: { clientId, clientSecret } }
  : {};

export const isGoogleAuthEnabled = "google" in googleAuthConfig;
