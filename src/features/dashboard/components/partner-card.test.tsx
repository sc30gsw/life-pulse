// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import { PartnerCard, PartnerCardFallback } from "~/features/dashboard/components/partner-card";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  onSetPresence: vi.fn(),
  partner: null as null | { etaHm?: string; state: "commuting_home" | "home"; updatedAt: number },
  role: "self" as "partner" | "self",
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-presence", () => ({
  useDashboardPresence: () => ({
    onSetPresence: hookState.onSetPresence,
    partner: hookState.partner,
    partnerFlash: false,
    partnerUpdatedRelativeLabel: "5分前",
  }),
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-viewer", () => ({
  useDashboardViewer: () => ({ role: hookState.role }),
}));

beforeEach(() => {
  hookState.onSetPresence.mockClear();
  hookState.partner = null;
  hookState.role = "self";
});

test("shows 未設定 when partner is null", () => {
  const { getByText } = renderWithMantine(<PartnerCard />);

  expect(getByText("未設定")).toBeDefined();
  expect(getByText("まだステータスが更新されていません")).toBeDefined();
});

test("hides the YOU badge and presence buttons when not the partner view", () => {
  const { getByText, queryByRole, queryByText } = renderWithMantine(<PartnerCard />);

  expect(getByText("パートナー")).toBeDefined();
  expect(queryByText("YOU")).toBeNull();
  expect(queryByRole("button")).toBeNull();
});

test("shows the YOU badge and calls onSetPresence from presence buttons in the partner view", async () => {
  hookState.role = "partner";
  hookState.partner = { state: "home", updatedAt: 0 };
  const user = userEvent.setup();
  const { getAllByText, getByRole, getByText } = renderWithMantine(<PartnerCard />);

  expect(getByText("本人")).toBeDefined();
  expect(getByText("YOU")).toBeDefined();
  expect(getAllByText("在宅").length).toBeGreaterThan(0);
  expect(getByText("家にいます")).toBeDefined();

  await user.click(getByRole("button", { name: "外出" }));

  expect(hookState.onSetPresence).toHaveBeenCalledWith("out");
});

test("shows the ETA input while commuting home and submits the typed value", async () => {
  hookState.role = "partner";
  hookState.partner = { state: "commuting_home", updatedAt: 0 };
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<PartnerCard />);

  await user.type(getByLabelText("帰宅ETA"), "20:30");
  await user.click(getByRole("button", { name: "ETA設定" }));

  expect(hookState.onSetPresence).toHaveBeenCalledWith("commuting_home", "20:30");
});

test("renders a structure-aware shimmer fallback", () => {
  const { getAllByText, getByText } = renderWithMantine(<PartnerCardFallback />);

  expect(getByText("パートナー")).toBeDefined();
  expect(getAllByText("在宅").length).toBeGreaterThan(0);
  expect(getByText("更新 たった今")).toBeDefined();
});
