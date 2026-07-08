// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import { SelfBadge, SelfBadgeFallback } from "~/features/dashboard/components/session-self-badge";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  role: "self" as "partner" | "self",
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-viewer", () => ({
  useDashboardViewer: () => ({ role: hookState.role }),
}));

test("renders YOU for the self viewer", () => {
  hookState.role = "self";

  const { getByText } = renderWithMantine(<SelfBadge />);

  expect(getByText("YOU")).toBeDefined();
});

test("renders nothing for a partner viewer", () => {
  hookState.role = "partner";

  const { queryByText } = renderWithMantine(<SelfBadge />);

  expect(queryByText("YOU")).toBeNull();
});

test("SelfBadgeFallback renders the loading badge", () => {
  const { getByText } = renderWithMantine(<SelfBadgeFallback />);

  expect(getByText("YOU")).toBeDefined();
});
