import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { drafts } from "./routes/drafts";
import { branding } from "./routes/branding";
import { usage } from "./routes/usage";
import { auth } from "./auth";

export const router = {
  ping,
  drafts,
  branding,
  usage,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

// Better Auth handler — Google (managed) + e-mail/mot de passe.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export default app;
