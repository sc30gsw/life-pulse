// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import {
  HealthMetricsGrid,
  HealthMetricsGridFallback,
} from "~/features/dashboard/components/health-metrics-grid";
import { renderWithMantine } from "~/test-utils";

let metrics: Doc<"healthMetrics"> | null = null;
const hookState = vi.hoisted(() => ({
  mutate: vi.fn(),
  notificationShow: vi.fn(),
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-health", () => ({
  useDashboardHealth: () => ({ dateJst: "2026-07-08", lastSyncRelativeLabel: "5分前", metrics }),
}));

vi.mock("~/features/health/hooks/use-request-garmin-sync", () => ({
  useRequestGarminSync: () => ({ isPending: false, mutate: hookState.mutate }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: hookState.notificationShow },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

function buildMetrics(overrides: Partial<Doc<"healthMetrics">> = {}): Doc<"healthMetrics"> {
  return {
    _creationTime: 0,
    _id: "metrics_1",
    dateJst: "2026-07-07",
    source: "garmin",
    syncedAt: 0,
    ...overrides,
  } as unknown as Doc<"healthMetrics">;
}

test("renders recovery actions when metrics is null", () => {
  metrics = null;

  const { getByRole, getByText } = renderWithMantine(<HealthMetricsGrid />);

  expect(getByText("今日のデータはまだありません")).toBeDefined();
  expect(
    getByText("Garminを同期すると、睡眠・Body Battery・歩数をここに表示します。"),
  ).toBeDefined();
  expect(getByText("2026/07/08")).toBeDefined();
  expect(getByRole("button", { name: "Garminを同期" })).toBeDefined();
  expect(getByRole("link", { name: "詳細" }).getAttribute("href")).toBe("/health");
});

test("clicking the empty-state sync button requests Garmin sync", async () => {
  metrics = null;
  hookState.mutate.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<HealthMetricsGrid />);

  await user.click(getByRole("button", { name: "Garminを同期" }));

  expect(hookState.mutate).toHaveBeenCalledTimes(1);
  const [payload] = hookState.mutate.mock.calls[0] as [Record<string, unknown>];
  expect(payload).toEqual({});
});

test("renders the source label and full metric values", () => {
  metrics = buildMetrics({
    bodyBattery: 72,
    hrv: 45,
    restingHr: 58,
    sleepMinutes: 420,
    sleepScore: 88,
    source: "garmin",
    steps: 8_432,
  });

  const { getByText } = renderWithMantine(<HealthMetricsGrid />);

  expect(getByText("source: garmin · 2026/07/07")).toBeDefined();
  expect(getByText("72")).toBeDefined();
  expect(getByText("88")).toBeDefined();
  expect(getByText("7.0h")).toBeDefined();
  expect(getByText("58")).toBeDefined();
  expect(getByText("8,432")).toBeDefined();
});

test("falls back to defaults and dashes when optional metrics are missing", () => {
  metrics = buildMetrics({ source: "manual" });

  const { getAllByText, getByText } = renderWithMantine(<HealthMetricsGrid />);

  expect(getByText("source: manual · 2026/07/07")).toBeDefined();
  expect(getAllByText("—")).toHaveLength(3);
  expect(getAllByText("0")).toHaveLength(3);
});

test("renders a structure-aware shimmer fallback", () => {
  const { getByText } = renderWithMantine(<HealthMetricsGridFallback />);

  expect(getByText("健康メトリクス · Garmin")).toBeDefined();
  expect(getByText("source: garmin")).toBeDefined();
});
