import { Field, Form, useForm } from "@formisch/react";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { useRequestEmailChange } from "~/features/profile/hooks/use-profile-actions";
import { EmailChangeSchema } from "~/features/profile/schemas/profile-schemas";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function EmailChangeForm() {
  const requestEmailChange = useRequestEmailChange();
  const form = useForm({
    initialInput: { newEmail: "" },
    schema: EmailChangeSchema,
  });

  return (
    <Form
      of={form}
      onSubmit={(output) => {
        requestEmailChange.mutate(output, {
          onError: () => {
            notifications.show({
              color: "red",
              message: "確認メールの送信に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: "新しいメールアドレス宛に確認メールを送信しました",
              title: "確認メールを送信しました",
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
        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          type="submit"
          style={ACCENT_SOLID_STYLE.good}
          loading={form.isSubmitting}
        >
          確認メールを送信
        </Button>
      </Stack>
    </Form>
  );
}
