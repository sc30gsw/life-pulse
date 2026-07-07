// @vitest-environment happy-dom
import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";

vi.mock("@tanstack/react-query", () => ({
  useSuspenseQuery: () => ({ data: { name: "自分", role: "self", userId: "user_1" } }),
}));

const { useDashboardViewer } = await import("~/features/dashboard/hooks/use-dashboard-viewer");

test("returns the viewer query data", () => {
  const { result } = renderHook(() => useDashboardViewer());

  expect(result.current).toEqual({ name: "自分", role: "self", userId: "user_1" });
});
