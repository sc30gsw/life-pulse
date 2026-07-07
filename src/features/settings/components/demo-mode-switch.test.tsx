// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { DemoModeSwitch } from "~/features/settings/components/demo-mode-switch";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  demoMode: false,
  mutate: vi.fn(),
}));

vi.mock("~/features/settings/api/settings-query", () => ({
  useSettings: () => ({
    data: { demoMode: hookState.demoMode, dogName: "ハマロ", fastingDefaultMinutes: 960 },
  }),
}));

vi.mock("~/features/settings/api/set-demo-mode-mutation", () => ({
  useSetDemoMode: () => ({ mutate: hookState.mutate }),
}));

test("hides the demo-data caption while demo mode is off", () => {
  hookState.demoMode = false;

  const { queryByText } = renderWithMantine(<DemoModeSwitch />);
  expect(queryByText("疑似データ流し込み中(20秒間隔)")).toBeNull();
});

test("shows the demo-data caption while demo mode is on", () => {
  hookState.demoMode = true;

  const { queryByText } = renderWithMantine(<DemoModeSwitch />);
  expect(queryByText("疑似データ流し込み中(20秒間隔)")).toBeDefined();
});

test("toggling the switch calls setDemoMode with enabled and today's JST date", async () => {
  hookState.demoMode = false;
  hookState.mutate.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<DemoModeSwitch />);

  await user.click(getByRole("switch"));

  expect(hookState.mutate).toHaveBeenCalledTimes(1);
  const [payload] = hookState.mutate.mock.calls[0] as [Record<string, unknown>];
  expect(payload.enabled).toBe(true);
  expect(payload.todayJst).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
