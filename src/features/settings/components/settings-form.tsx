import { Field, Form, useForm } from "@formisch/react";
import { Button, NumberInput, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";

import { useSettings } from "~/features/settings/api/settings-query";
import { useUpdateSettings } from "~/features/settings/api/update-settings-mutation";
import { UpdateSettingsSchema } from "~/features/settings/schemas/update-settings-schema";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function SettingsForm() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const settingsForm = useForm({
    initialInput: {
      dogName: settings.dogName,
      fastingDefaultMinutes: settings.fastingDefaultMinutes,
    },
    schema: UpdateSettingsSchema,
  });

  return (
    <Form
      of={settingsForm}
      onSubmit={(output) => {
        updateSettings.mutate(output, {
          onError: () => {
            notifications.show({
              color: "red",
              message: "設定の保存に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: "設定を保存しました",
              title: "保存しました",
            });
          },
        });
      }}
    >
      <Stack gap="md">
        <Field of={settingsForm} path={["fastingDefaultMinutes"]}>
          {(field) => (
            <NumberInput
              {...field.props}
              error={field.errors?.[0]}
              label="断食目標時間(分)"
              min={1}
              onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
              value={field.input}
              disabled={settingsForm.isSubmitting}
            />
          )}
        </Field>

        <Field of={settingsForm} path={["dogName"]}>
          {(field) => (
            <TextInput
              {...field.props}
              error={field.errors?.[0]}
              label="犬の名前"
              value={field.input}
              disabled={settingsForm.isSubmitting}
            />
          )}
        </Field>

        <Button
          className="hover:brightness-120"
          disabled={settingsForm.isSubmitting}
          loading={settingsForm.isSubmitting}
          style={ACCENT_SOLID_STYLE.good}
          type="submit"
        >
          保存する
        </Button>
      </Stack>
    </Form>
  );
}

export function SettingsFormFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <NumberInput label="断食目標時間(分)" />
        <TextInput label="犬の名前" />
        <Button className="hover:brightness-120">保存する</Button>
      </Stack>
    </Shimmer>
  );
}
