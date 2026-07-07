import { Field, Form, useForm } from "@formisch/react";
import { Button, NumberInput, SegmentedControl, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import type { ComponentProps } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useLogWorkout } from "~/features/health/hooks/use-log-workout";
import { useUpdateWorkout } from "~/features/health/hooks/use-update-workout";
import {
  LogWorkoutSchema,
  type LogWorkoutFormInput,
} from "~/features/health/schemas/log-workout-schema";
import { ACCENT_SOLID_STYLE, WORKOUT_KIND_LABELS, type WorkoutKind } from "~/types/dashboard";
import { dayjs } from "~/utils/dayjs";

const WORKOUT_KIND_DATA = (Object.keys(WORKOUT_KIND_LABELS) as WorkoutKind[]).map((value) => ({
  label: WORKOUT_KIND_LABELS[value],
  value,
}));

const DATE_TIME_PICKER_STYLES = {
  input: {
    backgroundColor: "var(--inset)",
    borderColor: "var(--bd2)",
    color: "var(--tx)",
  },
} as const satisfies ComponentProps<typeof DateTimePicker>["styles"];

const DATE_TIME_PICKER_POPOVER_PROPS = {
  styles: {
    dropdown: {
      backgroundColor: "var(--panel)",
      borderColor: "var(--bd2)",
      color: "var(--tx)",
    },
  },
} as const satisfies ComponentProps<typeof DateTimePicker>["popoverProps"];

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
            <SegmentedControl
              data={WORKOUT_KIND_DATA}
              disabled={logForm.isSubmitting}
              fullWidth
              onChange={field.onChange}
              value={field.input}
            />
          )}
        </Field>

        <Field of={logForm} path={["at"]}>
          {(field) => (
            <DateTimePicker
              disabled={logForm.isSubmitting}
              error={field.errors?.[0]}
              label="日時"
              onChange={(value) => field.onChange(value ?? undefined)}
              popoverProps={DATE_TIME_PICKER_POPOVER_PROPS}
              styles={DATE_TIME_PICKER_STYLES}
              value={field.input}
              valueFormat="YYYY-MM-DD HH:mm"
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
              value={field.input ?? ""}
            />
          )}
        </Field>

        <Field of={logForm} path={["perceivedIntensity"]}>
          {(field) => (
            <NumberInput
              {...field.props}
              error={field.errors?.[0]}
              label="主観強度(1〜10、任意)"
              max={10}
              min={1}
              onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
              value={field.input ?? ""}
            />
          )}
        </Field>

        <Button
          className="hover:brightness-120"
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
