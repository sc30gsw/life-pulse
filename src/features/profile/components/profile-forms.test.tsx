// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import {
  AvatarUploader,
  DisplayNameForm,
  EmailChangeForm,
  PasswordChangeForm,
  ProfileFormFallback,
} from "~/features/profile/components/profile-forms";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  notificationShow: vi.fn(),
  setAvatar: { isPending: false, mutateAsync: vi.fn() },
  updateDisplayName: { mutate: vi.fn() },
  updateEmail: { mutate: vi.fn() },
  updatePassword: { mutate: vi.fn() },
  uploadUrl: { isPending: false, mutateAsync: vi.fn() },
  viewer: {
    _creationTime: 0,
    _id: "user_1",
    authSubject: "auth_1",
    avatarStorageId: undefined,
    avatarUrl: "https://example.com/avatar.jpg",
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
  useGenerateAvatarUploadUrl: () => state.uploadUrl,
  useSetAvatar: () => state.setAvatar,
  useUpdateDisplayName: () => state.updateDisplayName,
  useUpdateEmail: () => state.updateEmail,
  useUpdatePassword: () => state.updatePassword,
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

  await user.clear(getByLabelText("表示名"));
  await user.type(getByLabelText("表示名"), " 新しい本人 ");
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
});

test("AvatarUploader shows EmptyState when viewer is missing", () => {
  state.viewer = null as never;
  const { getByText } = renderWithMantine(<AvatarUploader />);

  expect(getByText("プロフィール未作成")).toBeDefined();
});

test("EmailChangeForm submits email change payload", async () => {
  state.updateEmail.mutate.mockClear();
  state.updateEmail.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<EmailChangeForm />);

  await user.type(getByLabelText("新しいメールアドレス"), "new@example.com");
  await user.type(getByLabelText("現在のパスワード"), "OldPassw0rd1");
  await user.click(getByRole("button", { name: "メールアドレスを変更" }));

  expect(state.updateEmail.mutate).toHaveBeenCalledWith(
    { currentPassword: "OldPassw0rd1", newEmail: "new@example.com" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});

test("PasswordChangeForm submits current and new password only", async () => {
  state.updatePassword.mutate.mockClear();
  state.updatePassword.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<PasswordChangeForm />);

  await user.type(getByLabelText("現在のパスワード"), "OldPassw0rd1");
  await user.type(getByLabelText("新しいパスワード"), "NewPassw0rd1");
  await user.type(getByLabelText("新しいパスワード(確認)"), "NewPassw0rd1");
  await user.click(getByRole("button", { name: "パスワードを変更" }));

  expect(state.updatePassword.mutate).toHaveBeenCalledWith(
    { currentPassword: "OldPassw0rd1", newPassword: "NewPassw0rd1" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});

test("ProfileFormFallback renders loading copy", () => {
  const { getByText } = renderWithMantine(<ProfileFormFallback />);

  expect(getByText("プロフィールを読み込み中")).toBeDefined();
});
