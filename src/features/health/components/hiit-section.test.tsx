// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { HiitSection } from "~/features/health/components/hiit-section";
import { renderWithMantine } from "~/test-utils";

const componentState = vi.hoisted(() => ({
  modalTargets: [] as unknown[],
}));

vi.mock("~/features/health/components/hiit-log-modal", () => ({
  HiitLogModal: ({ target }: { target: unknown }) => {
    componentState.modalTargets.push(target);
    return <div data-testid="hiit-log-modal">{target === null ? "closed" : "opened"}</div>;
  },
}));

vi.mock("~/features/health/components/workout-list", () => ({
  WorkoutList: () => <div>workout list</div>,
  WorkoutListFallback: () => <div>loading workouts</div>,
}));

vi.mock("~/features/health/components/hiit-trend", () => ({
  HiitTrend: () => <div>hiit trend</div>,
  HiitTrendFallback: () => <div>loading hiit trend</div>,
}));

test("renders the recent workout section and opens the log modal", async () => {
  componentState.modalTargets = [];
  const user = userEvent.setup();
  const { getByRole, getByTestId, getByText } = renderWithMantine(<HiitSection />);

  expect(getByText("直近28日間の記録")).toBeDefined();
  expect(getByText("workout list")).toBeDefined();
  expect(getByTestId("hiit-log-modal").textContent).toBe("closed");

  await user.click(getByRole("button", { name: "記録" }));

  expect(getByTestId("hiit-log-modal").textContent).toBe("opened");
  expect(componentState.modalTargets).toContain("new");
});
