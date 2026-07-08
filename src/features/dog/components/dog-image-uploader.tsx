import { Avatar, Button, EmptyState, FileButton, Group, Slider, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconPhotoUp } from "@tabler/icons-react";
import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { DOG_PROFILE_COPY } from "~/features/dog/constants/dog-profile";
import { useDog } from "~/features/dog/hooks/use-dog";
import { useGenerateDogImageUploadUrl, useSetDogImage } from "~/features/dog/hooks/use-update-dog";
import { cropImageToAvatarBlob } from "~/features/profile/utils/crop-image";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";
import { uploadBlobToConvexStorage } from "~/utils/convex-storage-upload";

export function DogImageUploader() {
  const { data: dog } = useDog();
  const generateUploadUrl = useGenerateDogImageUploadUrl();
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
        message: DOG_PROFILE_COPY.notification.imageSaveSuccessMessage,
        title: DOG_PROFILE_COPY.notification.savedTitle,
      });
    } catch {
      notifications.show({
        color: "red",
        message: DOG_PROFILE_COPY.notification.imageSaveErrorMessage,
        title: "エラー",
      });
    }
  }

  return (
    <Stack gap="md">
      <Group align="center">
        <Avatar name={dog.name} radius="md" size={76} src={dog.imageUrl} />
        <FileButton accept="image/*" onChange={onFileSelect}>
          {(props) => (
            <Button
              {...props}
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              leftSection={<IconPhotoUp size={16} />}
              variant="outline"
            >
              {DOG_PROFILE_COPY.actions.choosePhoto}
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
              {DOG_PROFILE_COPY.actions.cancel}
            </Button>
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              loading={generateUploadUrl.isPending || setDogImage.isPending}
              onClick={onSave}
              style={ACCENT_SOLID_STYLE.good}
            >
              {DOG_PROFILE_COPY.actions.savePhoto}
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
          <Avatar name={DOG_PROFILE_COPY.fallbackName} radius="md" size={76} />
          <Button className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100">
            {DOG_PROFILE_COPY.actions.choosePhoto}
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
          {DOG_PROFILE_COPY.missing.title}
        </Text>
      }
      description={DOG_PROFILE_COPY.missing.imageDescription}
    />
  );
}
