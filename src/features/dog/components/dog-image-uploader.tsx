import { Avatar, Button, EmptyState, FileButton, Group, Slider, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconPhotoUp, IconTrash } from "@tabler/icons-react";
import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { useDog } from "~/features/dog/hooks/use-dog";
import {
  useGenerateDogImageUploadUrl,
  useRemoveDogImage,
  useSetDogImage,
} from "~/features/dog/hooks/use-update-dog";
import { cropImageToAvatarBlob } from "~/features/profile/utils/crop-image";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";
import { uploadBlobToConvexStorage } from "~/utils/convex-storage-upload";

export function DogImageUploader() {
  const { data: dog } = useDog();
  const generateUploadUrl = useGenerateDogImageUploadUrl();
  const removeDogImage = useRemoveDogImage();
  const setDogImage = useSetDogImage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  if (dog === null) {
    return <MissingDogEmptyState />;
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

    try {
      await Promise.all([
        generateUploadUrl.mutateAsync({}),
        cropImageToAvatarBlob(imageSrc, croppedAreaPixels),
      ])
        .then(([uploadUrl, blob]) => uploadBlobToConvexStorage(uploadUrl, blob, "image/jpeg"))
        .then((storageId) => setDogImage.mutateAsync({ storageId }));
      setImageSrc(null);
      notifications.show({
        color: "green",
        message: "犬の写真を保存しました",
        title: "保存しました",
      });
    } catch {
      notifications.show({
        color: "red",
        message: "犬の写真の保存に失敗しました",
        title: "エラー",
      });
    }
  }

  function onRemove() {
    modals.openConfirmModal({
      cancelProps: { variant: "subtle" },
      centered: true,
      children: <Text size="sm">現在の犬の写真を削除します。元に戻せません。</Text>,
      confirmProps: { color: "red" },
      labels: { cancel: "キャンセル", confirm: "削除する" },
      onConfirm: () => {
        removeDogImage.mutate(
          {},
          {
            onError: () => {
              notifications.show({
                color: "red",
                message: "犬の写真の削除に失敗しました",
                title: "エラー",
              });
            },
            onSuccess: () => {
              notifications.show({
                color: "green",
                message: "犬の写真を削除しました",
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
      title: "犬の写真を削除しますか？",
    });
  }

  const hasDogImage = dog.imageStorageId !== undefined;

  return (
    <Stack gap="md">
      <Group align="center" gap="md" wrap="nowrap">
        <Avatar name={dog.name} radius="md" size={76} src={dog.imageUrl} />
        <Group gap="xs" className="min-w-0" wrap="wrap">
          <FileButton accept="image/*" onChange={onFileSelect}>
            {(props) => (
              <Button
                {...props}
                className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
                leftSection={<IconPhotoUp size={16} />}
                size="sm"
                variant="outline"
              >
                写真を選ぶ
              </Button>
            )}
          </FileButton>
          {hasDogImage ? (
            <Button
              aria-label="犬の写真を削除"
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={removeDogImage.isPending}
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
              cropShape="rect"
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
              onClick={() => setImageSrc(null)}
              variant="outline"
            >
              キャンセル
            </Button>
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              loading={generateUploadUrl.isPending || setDogImage.isPending}
              onClick={onSave}
              style={ACCENT_SOLID_STYLE.good}
            >
              写真を保存
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Stack>
  );
}

export function DogImageUploaderFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <Group align="center">
          <Avatar name="犬" radius="md" size={76} />
          <Button
            className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
            size="sm"
          >
            写真を選ぶ
          </Button>
        </Group>
      </Stack>
    </Shimmer>
  );
}

function MissingDogEmptyState() {
  return (
    <EmptyState
      title={
        <Text size="xl" fw={600} c="coral">
          犬プロフィール未作成
        </Text>
      }
      description="先に犬の名前を登録すると、写真をアップロードできます。"
    />
  );
}
