import { createElement } from "react";
import { render } from "react-email";
import { expect, test } from "vite-plus/test";

import { PasswordResetEmail } from "./passwordResetEmail";

test("PasswordResetEmail renders a descriptive reset link", async () => {
  const resetUrl = "https://example.com/reset-password?token=abc";
  const html = await render(createElement(PasswordResetEmail, { expiresInMinutes: 60, resetUrl }));

  expect(html).toContain('href="https://example.com/reset-password?token=abc"');
  expect(html).toContain("パスワード再設定を開く");
});
