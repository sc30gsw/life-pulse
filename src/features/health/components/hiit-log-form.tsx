import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, NumberInput, Stack, Text, UnstyledButton } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { cn } from "cnfast";

import type { Doc } from "~/../convex/_generated/dataModel";
import { WORKOUT_KIND_VALUES } from "~/../convex/lib/domain";
import {
  DATE_TIME_PICKER_CLASS_NAMES,
  DATE_TIME_PICKER_POPOVER_PROPS,
  DATE_TIME_PICKER_STYLES,
  TIME_PICKER_PROPS,
  getDayAriaLabel,
  getDayProps,
  renderHolidayDay,
} from "~/components/date-time-picker-style";
import { useLogWorkout } from "~/features/health/hooks/use-log-workout";
import { useUpdateWorkout } from "~/features/health/hooks/use-update-workout";
import {
  LogWorkoutSchema,
  type LogWorkoutFormInput,
} from "~/features/health/schemas/log-workout-schema";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  type WorkoutKind,
} from "~/types/dashboard";
import { todayJst } from "~/utils/date-jst";
import { dayjs } from "~/utils/dayjs";

export type EditableWorkout = Pick<
  Doc<"workouts">,
  "_id" | "at" | "durationMinutes" | "kind" | "perceivedIntensity"
>;

type HiitLogFormProps = {
  onDone: () => void;
  workout?: EditableWorkout;
};

function initialInput(workout?: EditableWorkout): LogWorkoutFormInput {
  return {
    at: dayjs(workout?.at ?? Date.now())
      .tz("Asia/Tokyo")
      .format("YYYY-MM-DD HH:mm:ss"),
    durationMinutes: workout?.durationMinutes ?? 30,
    kind: (workout?.kind as WorkoutKind | undefined) ?? "hiit",
    perceivedIntensity: workout?.perceivedIntensity,
  };
}

function workoutKindLabel(kind: WorkoutKind) {
  switch (kind) {
    case "hiit":
      return "HIIT";
    case "other":
      return "その他";
    case "walk":
      return "ウォーキング";
  }
}

export function HiitLogForm({ workout, onDone }: HiitLogFormProps) {
  const logForm = useForm({ initialInput: initialInput(workout), schema: LogWorkoutSchema });
  const logWorkout = useLogWorkout();
  const updateWorkout = useUpdateWorkout();
  const isEditing = workout !== undefined;

  return (
    <Form
      of={logForm}
      onSubmit={(output) => {
        const options = {
          onError: () => {
            notifications.show({
              color: "red",
              message: isEditing ? "記録の更新に失敗しました" : "記録に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: isEditing ? "記録を更新しました" : "記録しました",
              title: isEditing ? "更新しました" : "記録しました",
            });
            onDone();
          },
        };

        if (isEditing) {
          updateWorkout.mutate({ ...output, workoutId: workout._id }, options);
        } else {
          logWorkout.mutate(output, options);
        }
      }}
    >
      <Stack gap="md">
        <Field of={logForm} path={["kind"]}>
          {(field) => (
            <Stack gap={6}>
              <Text
                component="span"
                size="10.5px"
                fw={600}
                tt="uppercase"
                c={ACCENT_VARS.faint}
                style={{ letterSpacing: "0.13em" }}
              >
                種別
              </Text>
              <Group gap={8} wrap="wrap">
                {WORKOUT_KIND_VALUES.map((kind) => {
                  const isActive = field.input === kind;

                  return (
                    <UnstyledButton
                      key={kind}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => field.onChange(kind)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
                        isActive
                          ? cn(
                              ACCENT_CLASSES.good.border,
                              ACCENT_CLASSES.good.bg,
                              ACCENT_CLASSES.good.text,
                              "font-semibold",
                            )
                          : "border-bd-2 bg-inset text-dim font-medium",
                      )}
                      disabled={logForm.isSubmitting}
                    >
                      {workoutKindLabel(kind)}
                    </UnstyledButton>
                  );
                })}
              </Group>
            </Stack>
          )}
        </Field>

        <Field of={logForm} path={["at"]}>
          {(field) => (
            <DateTimePicker
              name={field.props.name}
              classNames={DATE_TIME_PICKER_CLASS_NAMES}
              disabled={logForm.isSubmitting}
              error={field.errors?.[0]}
              getDayAriaLabel={getDayAriaLabel}
              getDayProps={getDayProps}
              label="日時"
              maxDate={todayJst()}
              onChange={(value) => field.onChange(value ?? undefined)}
              placeholder="YYYY-MM-DD HH:mm"
              popoverProps={DATE_TIME_PICKER_POPOVER_PROPS}
              renderDay={renderHolidayDay}
              styles={DATE_TIME_PICKER_STYLES}
              timePickerProps={TIME_PICKER_PROPS}
              value={field.input}
              valueFormat="YYYY-MM-DD HH:mm"
              weekendDays={[0]}
              withSeconds={false}
            />
          )}
        </Field>

        <Field of={logForm} path={["durationMinutes"]}>
          {(field) => (
            <NumberInput
              {...field.props}
              error={field.errors?.[0]}
              label="時間(分)"
              min={1}
              onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
              placeholder="20"
              disabled={logForm.isSubmitting}
              value={field.input ?? ""}
            />
          )}
        </Field>

        <Field of={logForm} path={["perceivedIntensity"]}>
          {(field) => (
            <NumberInput
              {...field.props}
              disabled={logForm.isSubmitting}
              error={field.errors?.[0]}
              label="主観強度(1〜10、任意)"
              max={10}
              min={1}
              onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
              placeholder="8"
              value={field.input ?? ""}
            />
          )}
        </Field>

        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          disabled={logForm.isSubmitting}
          loading={logForm.isSubmitting}
          style={ACCENT_SOLID_STYLE.good}
          type="submit"
        >
          {isEditing ? "更新する" : "記録する"}
        </Button>
      </Stack>
    </Form>
  );
}
