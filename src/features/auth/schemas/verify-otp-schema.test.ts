import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { VerifyOtpSchema } from "~/features/auth/schemas/verify-otp-schema";

test("accepts a six digit OTP code", () => {
  const result = v.safeParse(VerifyOtpSchema, { code: "123456" });

  expect(result.success).toBe(true);
});

test("rejects an incomplete OTP code", () => {
  const result = v.safeParse(VerifyOtpSchema, { code: "12345" });

  expect(result.success).toBe(false);
});

test("rejects a non-numeric OTP code", () => {
  const result = v.safeParse(VerifyOtpSchema, { code: "12345a" });

  expect(result.success).toBe(false);
});
