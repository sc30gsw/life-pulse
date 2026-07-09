import { Field, Form, reset, useForm } from "@formisch/react";
import { Button, PasswordInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock } from "@tabler/icons-react";

import { useUpdatePassword } from "~/features/profile/hooks/use-profile-actions";
import { PasswordChangeSchema } from "~/features/profile/schemas/profile-schemas";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

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
              reset(form);

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
            <PasswordInput
              {...field.props}
              error={field.errors?.[0]}
              label="現在のパスワード"
              leftSection={<IconLock size={16} />}
              required
              value={field.input}
              disabled={form.isSubmitting}
              placeholder="現在のパスワードを入力"
            />
          )}
        </Field>
        <Field of={form} path={["newPassword"]}>
          {(field) => (
            <PasswordInput
              {...field.props}
              error={field.errors?.[0]}
              label="新しいパスワード"
              leftSection={<IconLock size={16} />}
              required
              value={field.input}
              disabled={form.isSubmitting}
              placeholder="12文字以上・英大小文字+数字"
            />
          )}
        </Field>
        <Field of={form} path={["confirmPassword"]}>
          {(field) => (
            <PasswordInput
              {...field.props}
              error={field.errors?.[0]}
              label="新しいパスワード(確認)"
              leftSection={<IconLock size={16} />}
              required
              value={field.input}
              disabled={form.isSubmitting}
              placeholder="もう一度入力"
            />
          )}
        </Field>
        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          type="submit"
          style={ACCENT_SOLID_STYLE.good}
          loading={form.isSubmitting}
          disabled={form.isSubmitting}
        >
          パスワードを変更
        </Button>
      </Stack>
    </Form>
  );
}
