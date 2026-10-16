import { createAuthClient } from "better-auth/react";
import { managedAuthClient } from "@runablehq/managed-auth/client";

// Both values are injected into the app env and exposed to the browser by Vite.
// `issuer` is required — there is no default broker.
const config = {
  applicationId: import.meta.env.VITE_APPLICATION_ID as string,
  issuer: import.meta.env.VITE_RUNABLE_AUTH_ISSUER as string,
};

export const authClient = createAuthClient({
  // Packaged desktop builds load from file://, so the page origin is not the server there.
  baseURL: (import.meta.env.VITE_WEBSITE_URL as string | undefined) ?? window.location.origin,
  basePath: "/api/auth",
  plugins: [managedAuthClient(config)],
});
