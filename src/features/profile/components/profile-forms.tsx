import { Field, Form, useForm } from "@formisch/react";
import {
  Avatar,
  Button,
  EmptyState,
  FileButton,
  Group,
  Slider,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import type { Id } from "~/../convex/_generated/dataModel";
import { useViewer } from "~/features/auth/hooks/use-viewer";
import {
  useGenerateAvatarUploadUrl,
  useSetAvatar,
  useUpdateDisplayName,
  useUpdateEmail,
  useUpdatePassword,
} from "~/features/profile/hooks/use-profile-actions";
import {
  DisplayNameSchema,
  EmailChangeSchema,
  PasswordChangeSchema,
} from "~/features/profile/schemas/profile-schemas";
import { cropImageToAvatarBlob } from "~/features/profile/utils/crop-image";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function DisplayNameForm() {
  const { data: viewer } = useViewer();
  const updateDisplayName = useUpdateDisplayName();
  const form = useForm({
    initialInput: { displayName: viewer?.displayName ?? "" },
    schema: DisplayNameSchema,
  });

  if (viewer === null) {
    return <MissingViewerEmptyState />;
  }

  return (
    <Form
      of={form}
      onSubmit={(output) => {
        updateDisplayName.mutate(output, {
          onError: () => {
            notifications.show({
              color: "red",
              message: "表示名の保存に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: "表示名を保存しました",
              title: "保存しました",
            });
          },
        });
      }}
    >
      <Stack gap="md">
        <Field of={form} path={["displayName"]}>
          {(field) => (
            <TextInput
              {...field.props}
              disabled={form.isSubmitting}
              error={field.errors?.[0]}
              label="表示名"
              value={field.input}
            />
          )}
        </Field>
        <Button type="submit" style={ACCENT_SOLID_STYLE.good} loading={form.isSubmitting}>
          保存する
        </Button>
      </Stack>
    </Form>
  );
}

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

export function EmailChangeForm() {
  const updateEmail = useUpdateEmail();
  const form = useForm({
    initialInput: { currentPassword: "", newEmail: "" },
    schema: EmailChangeSchema,
  });

  return (
    <Form
      of={form}
      onSubmit={(output) => {
        updateEmail.mutate(output, {
          onError: () => {
            notifications.show({
              color: "red",
              message: "メールアドレスの変更に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: "メールアドレスを変更しました",
              title: "変更しました",
            });
          },
        });
      }}
    >
      <Stack gap="md">
        <Field of={form} path={["newEmail"]}>
          {(field) => (
            <TextInput
              {...field.props}
              error={field.errors?.[0]}
              label="新しいメールアドレス"
              value={field.input}
            />
          )}
        </Field>
        <Field of={form} path={["currentPassword"]}>
          {(field) => (
            <TextInput
              {...field.props}
              error={field.errors?.[0]}
              label="現在のパスワード"
              type="password"
              value={field.input}
            />
          )}
        </Field>
        <Button type="submit" style={ACCENT_SOLID_STYLE.good} loading={form.isSubmitting}>
          メールアドレスを変更
        </Button>
      </Stack>
    </Form>
  );
}

export function PasswordChangeForm() {
  const updatePassword = useUpdatePassword();
  const form = useForm({
    initialInput: { confirmPassword: "", currentPassword: "", newPassword: "" },
    schema: PasswordChangeSchema,
  });

  return (
    <Form
      of={form}
      onSubmit={(output) => {
        updatePassword.mutate(
          { currentPassword: output.currentPassword, newPassword: output.newPassword },
          {
            onError: () => {
              notifications.show({
                color: "red",
                message: "パスワードの変更に失敗しました",
                title: "エラー",
              });
            },
            onSuccess: () => {
              notifications.show({
                color: "green",
                message: "パスワードを変更しました",
                title: "変更しました",
              });
            },
          },
        );
      }}
    >
      <Stack gap="md">
        <Field of={form} path={["currentPassword"]}>
          {(field) => (
            <TextInput
              {...field.props}
              error={field.errors?.[0]}
              label="現在のパスワード"
              type="password"
              value={field.input}
            />
          )}
        </Field>
        <Field of={form} path={["newPassword"]}>
          {(field) => (
            <TextInput
              {...field.props}
              error={field.errors?.[0]}
              label="新しいパスワード"
              type="password"
              value={field.input}
            />
          )}
        </Field>
        <Field of={form} path={["confirmPassword"]}>
          {(field) => (
            <TextInput
              {...field.props}
              error={field.errors?.[0]}
              label="新しいパスワード(確認)"
              type="password"
              value={field.input}
            />
          )}
        </Field>
        <Button type="submit" style={ACCENT_SOLID_STYLE.good} loading={form.isSubmitting}>
          パスワードを変更
        </Button>
      </Stack>
    </Form>
  );
}

export function ProfileFormFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <Text size="sm">プロフィールを読み込み中</Text>
        <Button>保存する</Button>
      </Stack>
    </Shimmer>
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
