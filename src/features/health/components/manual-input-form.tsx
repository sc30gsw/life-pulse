import { Field, Form, useForm } from "@formisch/react";
import { Button, NumberInput, Stack, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";

import { useUpsertManual } from "~/features/health/hooks/use-upsert-manual";
import { UpsertManualSchema } from "~/features/health/schemas/upsert-manual-schema";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";
import { todayJst } from "~/utils/date-jst";

export function ManualInputForm() {
  const manualInputForm = useForm({
    initialInput: { dateJst: todayJst() },
    schema: UpsertManualSchema,
  });
  const upsertManual = useUpsertManual();

  return (
    <Form
      of={manualInputForm}
      onSubmit={(output) => {
        upsertManual.mutate(
          { ...output, todayJst: todayJst() },
          {
            onError: () => {
              notifications.show({
                color: "red",
                message: "健康データの保存に失敗しました",
                title: "エラー",
              });
            },
            onSuccess: () => {
              notifications.show({
                color: "green",
                message: `${output.dateJst} の健康データを保存しました`,
                title: "保存しました",
              });
            },
          },
        );
      }}
    >
      <Stack gap="md">
        <Text c="dimmed" size="xs">
          すべての項目は任意入力です。同じ日付を再送信すると、その日のデータは上書きされます。
        </Text>

        <Field of={manualInputForm} path={["dateJst"]}>
          {(field) => (
            <DateInput
              error={field.errors?.[0]}
              label="対象日"
              maxDate={todayJst()}
              onChange={(value) => field.onChange(value ?? undefined)}
              value={field.input}
              valueFormat="YYYY-MM-DD"
            />
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field of={manualInputForm} path={["sleepScore"]}>
            {(field) => (
              <NumberInput
                {...field.props}
                error={field.errors?.[0]}
                label="睡眠スコア"
                min={0}
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
              />
            )}
          </Field>
          <Field of={manualInputForm} path={["sleepMinutes"]}>
            {(field) => (
              <NumberInput
                {...field.props}
                error={field.errors?.[0]}
                label="睡眠時間(分)"
                min={0}
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
              />
            )}
          </Field>
          <Field of={manualInputForm} path={["bodyBattery"]}>
            {(field) => (
              <NumberInput
                {...field.props}
                error={field.errors?.[0]}
                label="Body Battery"
                min={0}
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
              />
            )}
          </Field>
          <Field of={manualInputForm} path={["hrv"]}>
            {(field) => (
              <NumberInput
                {...field.props}
                error={field.errors?.[0]}
                label="HRV(ms)"
                min={0}
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
              />
            )}
          </Field>
          <Field of={manualInputForm} path={["restingHr"]}>
            {(field) => (
              <NumberInput
                {...field.props}
                error={field.errors?.[0]}
                label="安静時心拍"
                min={0}
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
              />
            )}
          </Field>
          <Field of={manualInputForm} path={["steps"]}>
            {(field) => (
              <NumberInput
                {...field.props}
                error={field.errors?.[0]}
                label="歩数"
                min={0}
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
              />
            )}
          </Field>
        </div>

        <Button
          className="hover:brightness-120"
          disabled={manualInputForm.isSubmitting}
          loading={manualInputForm.isSubmitting}
          style={ACCENT_SOLID_STYLE.good}
          type="submit"
        >
          保存する
        </Button>
      </Stack>
    </Form>
  );
}
