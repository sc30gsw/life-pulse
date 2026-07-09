import { Field, Form, useForm } from "@formisch/react";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { useUpdateEmail } from "~/features/profile/hooks/use-profile-actions";
import { EmailChangeSchema } from "~/features/profile/schemas/profile-schemas";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

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
        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          type="submit"
          style={ACCENT_SOLID_STYLE.good}
          loading={form.isSubmitting}
        >
          メールアドレスを変更
        </Button>
      </Stack>
    </Form>
  );
}
