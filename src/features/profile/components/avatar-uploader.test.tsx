// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import { AvatarUploader } from "~/features/profile/components/avatar-uploader";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  notificationShow: vi.fn(),
  openConfirmModal: vi.fn(),
  removeAvatar: { isPending: false, mutate: vi.fn() },
  setAvatar: { isPending: false, mutateAsync: vi.fn() },
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

function defaultViewer() {
  return {
    _creationTime: 0,
    _id: "user_1",
    authSubject: "auth_1",
    avatarStorageId: "storage_avatar",
    avatarUrl: "https://example.com/avatar.jpg",
    displayName: "本人",
    role: "self",
  };
}

vi.mock("react-easy-crop", () => ({
  default: ({
    onCropComplete,
  }: {
    onCropComplete: (area: unknown, areaPixels: unknown) => void;
  }) => {
    onCropComplete({}, { height: 64, width: 64, x: 1, y: 2 });
    return <div>cropper</div>;
  },
}));

vi.mock("~/features/profile/utils/crop-image", () => ({
  cropImageToAvatarBlob: vi.fn(async () => new Blob(["avatar"], { type: "image/jpeg" })),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: state.notificationShow },
}));

vi.mock("@mantine/modals", () => ({
  modals: { openConfirmModal: state.openConfirmModal },
}));

vi.mock("~/features/auth/hooks/use-viewer", () => ({
  useViewer: () => ({ data: state.viewer }),
}));

vi.mock("~/features/profile/hooks/use-profile-actions", () => ({
  useGenerateAvatarUploadUrl: () => state.uploadUrl,
  useRemoveAvatar: () => state.removeAvatar,
  useSetAvatar: () => state.setAvatar,
}));

beforeEach(() => {
  state.viewer = defaultViewer() as never;
  state.notificationShow.mockClear();
  state.openConfirmModal.mockClear();
  state.removeAvatar.mutate.mockClear();
  state.setAvatar.mutateAsync.mockClear();
  state.uploadUrl.mutateAsync.mockClear();
});

test("AvatarUploader shows EmptyState when viewer is missing", () => {
  state.viewer = null as never;
  const { getByText } = renderWithMantine(<AvatarUploader />);

  expect(getByText("プロフィール未作成")).toBeDefined();
});

test("AvatarUploader uploads a cropped avatar and stores its storage id", async () => {
  state.viewer = {
    _creationTime: 0,
    _id: "user_1",
    authSubject: "auth_1",
    avatarStorageId: undefined,
    avatarUrl: null,
    displayName: "本人",
    role: "self",
  } as never;
  state.uploadUrl.mutateAsync.mockResolvedValue("https://upload.example.com");
  state.setAvatar.mutateAsync.mockResolvedValue(null);
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:avatar") });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      json: async () => ({ storageId: "storage_1" }),
      ok: true,
    })),
  );
  const user = userEvent.setup();
  const { container, getByRole, getByText } = renderWithMantine(<AvatarUploader />);

  const input = container.querySelector("input[type='file']");
  expect(input).not.toBeNull();
  await user.upload(
    input as HTMLInputElement,
    new File(["avatar"], "avatar.jpg", { type: "image/jpeg" }),
  );
  expect(getByText("cropper")).toBeDefined();
  await user.click(getByRole("button", { name: "アバターを保存" }));

  expect(state.uploadUrl.mutateAsync).toHaveBeenCalledWith({});
  expect(state.setAvatar.mutateAsync).toHaveBeenCalledWith({ storageId: "storage_1" });
});

test("AvatarUploader confirms before removing the current avatar", async () => {
  state.viewer = defaultViewer() as never;
  state.removeAvatar.mutate.mockImplementation((_input, callbacks) => {
    callbacks.onSuccess();
  });
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<AvatarUploader />);

  await user.click(getByRole("button", { name: "削除" }));

  expect(state.removeAvatar.mutate).not.toHaveBeenCalled();
  expect(state.openConfirmModal).toHaveBeenCalledWith(
    expect.objectContaining({
      labels: { cancel: "キャンセル", confirm: "削除する" },
      title: "アバター画像を削除しますか？",
    }),
  );

  const modal = state.openConfirmModal.mock.calls[0]?.[0] as { onConfirm: () => void };
  modal.onConfirm();

  expect(state.removeAvatar.mutate).toHaveBeenCalledWith(
    {},
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
  expect(state.notificationShow).toHaveBeenCalledWith({
    color: "green",
    message: "アバターを削除しました",
    title: "削除しました",
  });
});

test("AvatarUploader hides the remove button when no avatar is stored", () => {
  state.viewer = {
    ...defaultViewer(),
    avatarStorageId: undefined,
    avatarUrl: null,
  } as never;
  const { queryByRole } = renderWithMantine(<AvatarUploader />);

  expect(queryByRole("button", { name: "削除" })).toBeNull();
});

test("AvatarUploader reports upload errors", async () => {
  state.uploadUrl.mutateAsync.mockResolvedValue("https://upload.example.com");
  state.setAvatar.mutateAsync.mockClear();
  state.notificationShow.mockClear();
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:avatar") });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false })),
  );
  const user = userEvent.setup();
  const { container, getByRole } = renderWithMantine(<AvatarUploader />);

  const input = container.querySelector("input[type='file']");
  await user.upload(
    input as HTMLInputElement,
    new File(["avatar"], "avatar.jpg", { type: "image/jpeg" }),
  );
  await user.click(getByRole("button", { name: "アバターを保存" }));

  expect(state.notificationShow).toHaveBeenCalledWith({
    color: "red",
    message: "アバターの保存に失敗しました",
    title: "エラー",
  });
});
