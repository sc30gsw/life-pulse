import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { SignupSchema, type SignupInput } from "~/features/auth/schemas/signup-schema";

const validInput = {
  confirmPassword: "Password1234",
  displayName: "テスト太郎",
  email: "user@example.com",
  password: "Password1234",
  role: "self",
} as const satisfies SignupInput;

test("accepts a fully valid signup input", () => {
  const result = v.safeParse(SignupSchema, validInput);

  expect(result.success).toBe(true);
});

test("rejects a password shorter than 12 characters", () => {
  const result = v.safeParse(SignupSchema, {
    ...validInput,
    confirmPassword: "Pass1",
    password: "Pass1",
  });

  expect(result.success).toBe(false);
});

test("rejects a password without an uppercase letter", () => {
  const result = v.safeParse(SignupSchema, {
    ...validInput,
    confirmPassword: "password123",
    password: "password123",
  });

  expect(result.success).toBe(false);
});

test("rejects a password without a lowercase letter", () => {
  const result = v.safeParse(SignupSchema, {
    ...validInput,
    confirmPassword: "PASSWORD123",
    password: "PASSWORD123",
  });

  expect(result.success).toBe(false);
});

test("rejects a password without a digit", () => {
  const result = v.safeParse(SignupSchema, {
    ...validInput,
    confirmPassword: "PasswordOnly",
    password: "PasswordOnly",
  });

  expect(result.success).toBe(false);
});

test("rejects mismatched confirmPassword", () => {
  const result = v.safeParse(SignupSchema, {
    ...validInput,
    confirmPassword: "DifferentPassword123",
  });

  expect(result.success).toBe(false);
});

test("rejects an empty displayName", () => {
  const result = v.safeParse(SignupSchema, {
    ...validInput,
    displayName: "",
  });

  expect(result.success).toBe(false);
});

test("rejects a role outside self/partner", () => {
  const result = v.safeParse(SignupSchema, {
    ...validInput,
    role: "admin",
  });

  expect(result.success).toBe(false);
});
