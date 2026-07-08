import { Field, Form, useForm } from "@formisch/react";
import { Button, Slider, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";

import {
  FASTING_TARGET_SLIDER_MARKS,
  FASTING_TARGET_SLIDER_STYLES,
} from "~/features/fasting/constants/fasting-target-slider";
import {
  formatFastingTargetMinutes,
  MAX_FASTING_TARGET_MINUTES,
  MIN_FASTING_TARGET_MINUTES,
} from "~/features/fasting/constants/fasting-target";
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
            <Stack gap="xs">
              <div>
                <Text c="var(--tx)" fw={700} size="sm">
                  断食目標時間
                </Text>
                <Text c="var(--dim)" size="xs">
                  断食開始時の初期値として使われます。
                </Text>
              </div>
              <Slider
                disabled={settingsForm.isSubmitting}
                label={formatFastingTargetMinutes}
                marks={FASTING_TARGET_SLIDER_MARKS}
                max={MAX_FASTING_TARGET_MINUTES}
                min={MIN_FASTING_TARGET_MINUTES}
                onChange={field.onChange}
                step={1}
                styles={FASTING_TARGET_SLIDER_STYLES}
                thumbLabel="断食目標時間"
                thumbValueText={formatFastingTargetMinutes}
                value={field.input}
                className="mt-2 mb-4"
              />
              {field.errors?.[0] ? (
                <Text c="var(--coral)" size="xs">
                  {field.errors[0]}
                </Text>
              ) : null}
            </Stack>
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
        <Stack gap="xs">
          <Text fw={700} size="sm">
            断食目標時間
          </Text>
          <Slider
            disabled
            label={formatFastingTargetMinutes}
            marks={FASTING_TARGET_SLIDER_MARKS}
            max={MAX_FASTING_TARGET_MINUTES}
            min={MIN_FASTING_TARGET_MINUTES}
            step={1}
            styles={FASTING_TARGET_SLIDER_STYLES}
            value={MAX_FASTING_TARGET_MINUTES}
            className="mt-2 mb-4"
          />
        </Stack>
        <TextInput label="犬の名前" />
        <Button className="hover:brightness-120">保存する</Button>
      </Stack>
    </Shimmer>
  );
}
