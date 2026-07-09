// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { DisplayNameForm } from "~/features/profile/components/display-name-form";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  notificationShow: vi.fn(),
  updateDisplayName: { mutate: vi.fn() },
  viewer: {
    _creationTime: 0,
    _id: "user_1",
    authSubject: "auth_1",
    avatarStorageId: undefined,
    avatarUrl: null,
    displayName: "本人",
    role: "self",
  },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: state.notificationShow },
}));

vi.mock("~/features/auth/hooks/use-viewer", () => ({
  useViewer: () => ({ data: state.viewer }),
}));

vi.mock("~/features/profile/hooks/use-profile-actions", () => ({
  useUpdateDisplayName: () => state.updateDisplayName,
}));

test("DisplayNameForm shows EmptyState when viewer is missing", () => {
  state.viewer = null as never;
  const { getByText } = renderWithMantine(<DisplayNameForm />);

  expect(getByText("プロフィール未作成")).toBeDefined();
});

test("DisplayNameForm submits a trimmed display name and reports success", async () => {
  state.viewer = {
    _creationTime: 0,
    _id: "user_1",
    authSubject: "auth_1",
    avatarStorageId: undefined,
    avatarUrl: null,
    displayName: "本人",
    role: "self",
  } as never;
  state.updateDisplayName.mutate.mockClear();
  state.notificationShow.mockClear();
  state.updateDisplayName.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<DisplayNameForm />);

  await user.clear(getByLabelText(/表示名/));
  await user.type(getByLabelText(/表示名/), " 新しい本人 ");
  await user.click(getByRole("button", { name: "保存する" }));

  expect(state.updateDisplayName.mutate).toHaveBeenCalledWith(
    { displayName: "新しい本人" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
  expect(state.notificationShow).toHaveBeenCalledWith({
    color: "green",
    message: "表示名を保存しました",
    title: "保存しました",
  });
  expect((getByLabelText(/表示名/) as HTMLInputElement).value).toBe("新しい本人");
});
