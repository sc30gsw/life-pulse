// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import {
  SelfStatusCard,
  SelfStatusCardFallback,
} from "~/features/dashboard/components/self-status-card";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  onSetPresence: vi.fn(),
  role: "self" as "partner" | "self",
  self: null as null | { etaHm?: string; state: "commuting_home" | "home"; updatedAt: number },
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-self-presence", () => ({
  useDashboardSelfPresence: () => ({
    onSetPresence: hookState.onSetPresence,
    self: hookState.self,
    selfFlash: false,
    selfUpdatedRelativeLabel: "5分前",
  }),
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-viewer", () => ({
  useDashboardViewer: () => ({ role: hookState.role }),
}));

beforeEach(() => {
  hookState.onSetPresence.mockClear();
  hookState.self = null;
  hookState.role = "self";
});

test("shows 未設定 when self presence is null", () => {
  const { getByText } = renderWithMantine(<SelfStatusCard />);

  expect(getByText("未設定")).toBeDefined();
  expect(getByText("まだステータスが更新されていません")).toBeDefined();
});

test("hides the YOU badge and presence buttons when not the self view", () => {
  hookState.role = "partner";
  const { queryByRole, queryByText } = renderWithMantine(<SelfStatusCard />);

  expect(queryByText("YOU")).toBeNull();
  expect(queryByRole("button")).toBeNull();
});

test("shows the YOU badge and calls onSetPresence from presence buttons in the self view", async () => {
  hookState.role = "self";
  hookState.self = { state: "home", updatedAt: 0 };
  const user = userEvent.setup();
  const { getAllByText, getByRole, getByText } = renderWithMantine(<SelfStatusCard />);

  expect(getByText("YOU")).toBeDefined();
  expect(getAllByText("在宅").length).toBeGreaterThan(0);
  expect(getByText("家にいます")).toBeDefined();

  await user.click(getByRole("button", { name: "外出" }));

  expect(hookState.onSetPresence).toHaveBeenCalledWith("out");
});

test("shows the ETA input while commuting home and submits the typed value", async () => {
  hookState.role = "self";
  hookState.self = { state: "commuting_home", updatedAt: 0 };
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<SelfStatusCard />);

  await user.type(getByLabelText("帰宅ETA"), "20:30");
  await user.click(getByRole("button", { name: "ETA設定" }));

  expect(hookState.onSetPresence).toHaveBeenCalledWith("commuting_home", "20:30");
});

test("renders a structure-aware shimmer fallback", () => {
  const { getAllByText, getByText } = renderWithMantine(<SelfStatusCardFallback />);

  expect(getByText("本人 · 自分")).toBeDefined();
  expect(getAllByText("在宅").length).toBeGreaterThan(0);
  expect(getByText("更新 たった今")).toBeDefined();
});
