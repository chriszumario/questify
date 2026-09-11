import "server-only";

export const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
export const isPolarConfigured = Boolean(polarAccessToken);
