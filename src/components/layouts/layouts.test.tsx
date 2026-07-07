// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import { ErrorComponent } from "~/components/layouts/error";
import { NotFoundComponent } from "~/components/layouts/not-found";
import { PendingComponent } from "~/components/layouts/pending";
import { renderWithMantine } from "~/test-utils";

test("renders route errors with the error message", () => {
  const { getByRole, getByText } = renderWithMantine(
    <ErrorComponent error={new Error("boom")} info={{ componentStack: "" }} />,
  );

  expect(getByRole("heading", { name: "エラー" })).toBeDefined();
  expect(getByText("boom")).toBeDefined();
});

test("renders the not found page", () => {
  const { getByRole, getByText } = renderWithMantine(<NotFoundComponent />);

  expect(getByRole("heading", { name: "404" })).toBeDefined();
  expect(getByText("ページが見つかりませんでした。")).toBeDefined();
});

test("renders the pending skeleton as a busy output", () => {
  const { container, getByLabelText, getByText } = renderWithMantine(<PendingComponent />);

  expect(getByLabelText("読み込み中").getAttribute("aria-busy")).toBe("true");
  expect(getByText("Life Pulse")).toBeDefined();
  expect(getByText("Live Board")).toBeDefined();
  expect(container.querySelectorAll(".bg-inset")).toHaveLength(3);
  expect(container.querySelectorAll(".bg-panel")).toHaveLength(4);
});
