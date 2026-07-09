import resend from "@convex-dev/resend/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    APP_BASE_URL: v.string(),
    AUTH_OTP_PEPPER: v.string(),
    RESEND_API_KEY: v.string(),
    RESEND_FROM: v.string(),
    RESEND_REPLY_TO: v.string(),
    RESEND_TEST_MODE: v.optional(v.union(v.literal("true"), v.literal("false"))),
    RESEND_WEBHOOK_SECRET: v.string(),
  },
});
app.use(resend);

export default app;
