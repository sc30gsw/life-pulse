// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { SettingsForm, SettingsFormFallback } from "~/features/settings/components/settings-form";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  fastingDefaultMinutes: 960,
  mutate: vi.fn(),
  notificationShow: vi.fn(),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: hookState.notificationShow },
}));

vi.mock("~/features/settings/api/settings-query", () => ({
  useSettings: () => ({
    data: {
      demoMode: false,
      fastingDefaultMinutes: hookState.fastingDefaultMinutes,
    },
  }),
}));

vi.mock("~/features/settings/api/update-settings-mutation", () => ({
  useUpdateSettings: () => ({ mutate: hookState.mutate }),
}));

test("renders the current fasting target and submits it", async () => {
  hookState.fastingDefaultMinutes = 720;
  hookState.mutate.mockClear();
  hookState.notificationShow.mockClear();
  hookState.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();

  const { getByRole, getByText } = renderWithMantine(<SettingsForm />);

  expect(getByText("断食目標時間")).toBeDefined();
  expect(getByText("断食開始時の初期値として使われます。")).toBeDefined();

  await user.click(getByRole("button", { name: "保存する" }));

  expect(hookState.mutate).toHaveBeenCalledWith(
    { fastingDefaultMinutes: 720 },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
  expect(hookState.notificationShow).toHaveBeenCalledWith({
    color: "green",
    message: "設定を保存しました",
    title: "保存しました",
  });
});

test("shows an error notification when saving fails", async () => {
  hookState.fastingDefaultMinutes = 960;
  hookState.mutate.mockClear();
  hookState.notificationShow.mockClear();
  hookState.mutate.mockImplementation((_input, callbacks) => callbacks.onError());
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<SettingsForm />);

  await user.click(getByRole("button", { name: "保存する" }));

  expect(hookState.notificationShow).toHaveBeenCalledWith({
    color: "red",
    message: "設定の保存に失敗しました",
    title: "エラー",
  });
});

test("SettingsFormFallback renders the disabled loading controls", () => {
  const { getByRole, getByText } = renderWithMantine(<SettingsFormFallback />);

  expect(getByText("断食目標時間")).toBeDefined();
  expect(getByText("保存する")).toBeDefined();
  expect(getByRole("slider", { hidden: true }).getAttribute("aria-disabled")).toBe("true");
});
