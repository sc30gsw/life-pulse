// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { AvatarUploader } from "~/features/profile/components/avatar-uploader";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  notificationShow: vi.fn(),
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

vi.mock("~/features/auth/hooks/use-viewer", () => ({
  useViewer: () => ({ data: state.viewer }),
}));

vi.mock("~/features/profile/hooks/use-profile-actions", () => ({
  useGenerateAvatarUploadUrl: () => state.uploadUrl,
  useSetAvatar: () => state.setAvatar,
}));

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
