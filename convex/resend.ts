import { Resend } from "@convex-dev/resend";

import { components, internal } from "./_generated/api";
import { env } from "./_generated/server";

export const resend: Resend = new Resend(components.resend, {
  apiKey: env.RESEND_API_KEY,
  onEmailEvent: internal.resend.handleEmailEvent,
  testMode: env.RESEND_TEST_MODE !== "false",
  webhookSecret: env.RESEND_WEBHOOK_SECRET,
});

export const handleEmailEvent = resend.defineOnEmailEvent(async () => {});
