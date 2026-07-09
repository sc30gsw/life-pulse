import { Avatar, Button, EmptyState, FileButton, Group, Slider, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import { Result } from "better-result";
import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { useViewer } from "~/features/auth/hooks/use-viewer";
import {
  useGenerateAvatarUploadUrl,
  useRemoveAvatar,
  useSetAvatar,
} from "~/features/profile/hooks/use-profile-actions";
import { cropImageToAvatarBlob } from "~/features/profile/utils/crop-image";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";
import { ClientOperationError } from "~/utils/client-operation-error";
import { uploadBlobToConvexStorage } from "~/utils/convex-storage-upload";

export function AvatarUploader() {
  const { data: viewer } = useViewer();
  const generateUploadUrl = useGenerateAvatarUploadUrl();
  const removeAvatar = useRemoveAvatar();
  const setAvatar = useSetAvatar();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  if (viewer === null) {
    return <MissingViewerEmptyState />;
  }

  async function onFileSelect(file: File | null) {
    if (file === null) {
      return;
    }

    setImageSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function onSave() {
    const croppedAreaPixels = croppedAreaPixelsRef.current;
    if (imageSrc === null || croppedAreaPixels === null) {
      return;
    }

    const saveResult = await Result.tryPromise({
      catch: (cause) => new ClientOperationError({ cause, code: "AVATAR_SAVE_FAILED" }),
      try: () =>
        Promise.all([
          generateUploadUrl.mutateAsync({}),
          cropImageToAvatarBlob(imageSrc, croppedAreaPixels),
        ])
          .then(([uploadUrl, blob]) => uploadBlobToConvexStorage(uploadUrl, blob, "image/jpeg"))
          .then((storageId) => setAvatar.mutateAsync({ storageId })),
    });

    if (Result.isOk(saveResult)) {
      setImageSrc(null);

      notifications.show({
        color: "green",
        message: "アバターを保存しました",
        title: "保存しました",
      });
      return;
    }

    if (Result.isError(saveResult)) {
      notifications.show({
        color: "red",
        message: "アバターの保存に失敗しました",
        title: "エラー",
      });
    }
  }

  function onRemove() {
    modals.openConfirmModal({
      cancelProps: { variant: "subtle" },
      centered: true,
      children: <Text size="sm">現在のアバター画像を削除します。元に戻せません。</Text>,
      confirmProps: { color: "red" },
      labels: { cancel: "キャンセル", confirm: "削除する" },
      onConfirm: () => {
        removeAvatar.mutate(
          {},
          {
            onError: () => {
              notifications.show({
                color: "red",
                message: "アバターの削除に失敗しました",
                title: "エラー",
              });
            },
            onSuccess: () => {
              notifications.show({
                color: "green",
                message: "アバターを削除しました",
                title: "削除しました",
              });
            },
          },
        );
      },
      styles: {
        body: { color: "var(--tx)" },
        content: {
          backgroundColor: "var(--panel)",
          border: "1px solid var(--bd2)",
          color: "var(--tx)",
        },
        header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
        title: { color: "var(--tx)", fontWeight: 700 },
      },
      title: "アバター画像を削除しますか？",
    });
  }

  const hasAvatar = viewer.avatarStorageId !== undefined;

  return (
    <Stack gap="md">
      <Group align="center" gap="md" wrap="nowrap">
        <Avatar name={viewer.displayName} radius="xl" size={64} src={viewer.avatarUrl} />
        <Group gap="xs" className="min-w-0" wrap="wrap">
          <FileButton accept="image/*" onChange={onFileSelect}>
            {(props) => (
              <Button
                {...props}
                className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
                leftSection={<IconUpload size={16} />}
                size="sm"
                variant="outline"
              >
                画像を選ぶ
              </Button>
            )}
          </FileButton>
          {hasAvatar ? (
            <Button
              aria-label="アバター画像を削除"
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={removeAvatar.isPending}
              onClick={onRemove}
              size="sm"
              variant="outline"
            >
              削除
            </Button>
          ) : null}
        </Group>
      </Group>

      {imageSrc !== null ? (
        <Stack gap="sm">
          <div className="border-bd bg-inset relative h-72 overflow-hidden rounded-lg border">
            <Cropper
              aspect={1}
              crop={crop}
              cropShape="round"
              image={imageSrc}
              onCropChange={setCrop}
              onCropComplete={(_, areaPixels) => {
                croppedAreaPixelsRef.current = areaPixels;
              }}
              onZoomChange={setZoom}
              showGrid={false}
              zoom={zoom}
            />
          </div>
          <Slider
            label={(value) => `${value.toFixed(1)}x`}
            max={3}
            min={1}
            onChange={setZoom}
            step={0.1}
            value={zoom}
          />
          <Group justify="flex-end">
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              variant="outline"
              onClick={() => setImageSrc(null)}
            >
              キャンセル
            </Button>
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              loading={generateUploadUrl.isPending || setAvatar.isPending}
              onClick={onSave}
              style={ACCENT_SOLID_STYLE.good}
            >
              アバターを保存
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Stack>
  );
}

function MissingViewerEmptyState() {
  return (
    <EmptyState
      title={
        <Text size="xl" fw={600} c="coral">
          プロフィール未作成
        </Text>
      }
      description="ログイン情報に対応するプロフィールが見つかりません。"
    />
  );
}
