import { Field, Form, useForm } from "@formisch/react";
import { Button, EmptyState, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { useViewer } from "~/features/auth/hooks/use-viewer";
import { useUpdateDisplayName } from "~/features/profile/hooks/use-profile-actions";
import { DisplayNameSchema } from "~/features/profile/schemas/profile-schemas";
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
