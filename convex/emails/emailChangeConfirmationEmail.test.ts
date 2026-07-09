import { createElement } from "react";
import { render, toPlainText } from "react-email";
import { expect, test } from "vite-plus/test";

import { EmailChangeConfirmationEmail } from "./emailChangeConfirmationEmail";

test("EmailChangeConfirmationEmail renders a descriptive confirmation link", async () => {
  const confirmationUrl = "https://example.com/profile?emailChangeToken=abc";
  const html = await render(
    createElement(EmailChangeConfirmationEmail, {
      confirmationUrl,
      expiresInMinutes: 60,
      newEmail: "new@example.com",
    }),
  );
  const text = toPlainText(html);

  expect(html).toContain('href="https://example.com/profile?emailChangeToken=abc"');
  expect(text).toContain("new@example.com");
  expect(text).toContain("メールアドレス変更を確認");
});
