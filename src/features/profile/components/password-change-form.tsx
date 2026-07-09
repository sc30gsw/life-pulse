import { Field, Form, useForm } from "@formisch/react";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

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
        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          type="submit"
          style={ACCENT_SOLID_STYLE.good}
          loading={form.isSubmitting}
        >
          パスワードを変更
        </Button>
      </Stack>
    </Form>
  );
}
