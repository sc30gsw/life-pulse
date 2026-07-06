import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { LoginSchema } from "~/features/auth/schemas/login-schema";

test("accepts a valid email and non-empty password", () => {
  const result = v.safeParse(LoginSchema, {
    email: "user@example.com",
    password: "anything",
  });

  expect(result.success).toBe(true);
});

test("rejects a malformed email", () => {
  const result = v.safeParse(LoginSchema, {
    email: "not-an-email",
    password: "anything",
  });

  expect(result.success).toBe(false);
});

test("rejects an empty password", () => {
  const result = v.safeParse(LoginSchema, {
    email: "user@example.com",
    password: "",
  });

  expect(result.success).toBe(false);
});
