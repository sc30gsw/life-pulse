import { Avatar, Button, FileButton, Group, Slider, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import type { Id } from "~/../convex/_generated/dataModel";
import { useViewer } from "~/features/auth/hooks/use-viewer";
import { MissingViewerEmptyState } from "~/features/profile/components/profile-states";
import {
  useGenerateAvatarUploadUrl,
  useSetAvatar,
} from "~/features/profile/hooks/use-profile-actions";
import { cropImageToAvatarBlob } from "~/features/profile/utils/crop-image";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function AvatarUploader() {
  const { data: viewer } = useViewer();
  const generateUploadUrl = useGenerateAvatarUploadUrl();
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

    try {
      const [uploadUrl, blob] = await Promise.all([
        generateUploadUrl.mutateAsync({}),
        cropImageToAvatarBlob(imageSrc, croppedAreaPixels),
      ]);
      const response = await fetch(uploadUrl, {
        body: blob,
        headers: { "Content-Type": "image/jpeg" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("AVATAR_UPLOAD_FAILED");
      }

      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
      await setAvatar.mutateAsync({ storageId });
      setImageSrc(null);
      notifications.show({
        color: "green",
        message: "アバターを保存しました",
        title: "保存しました",
      });
    } catch {
      notifications.show({
        color: "red",
        message: "アバターの保存に失敗しました",
        title: "エラー",
      });
    }
  }

  return (
    <Stack gap="md">
      <Group align="center">
        <Avatar name={viewer.displayName} radius="xl" size={64} src={viewer.avatarUrl} />
        <FileButton accept="image/*" onChange={onFileSelect}>
          {(props) => (
            <Button {...props} leftSection={<IconUpload size={16} />} variant="outline">
              画像を選ぶ
            </Button>
          )}
        </FileButton>
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
            <Button variant="outline" onClick={() => setImageSrc(null)}>
              キャンセル
            </Button>
            <Button
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
