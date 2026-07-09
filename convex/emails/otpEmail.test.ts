import { createElement } from "react";
import { render, toPlainText } from "react-email";
import { expect, test } from "vite-plus/test";

import { OtpEmail } from "./otpEmail";

test("OtpEmail renders the one-time code in html and plain text", async () => {
  const html = await render(createElement(OtpEmail, { code: "123456", expiresInMinutes: 10 }));
  const text = toPlainText(html);

  expect(html).toContain("123456");
  expect(text).toContain("123456");
});
