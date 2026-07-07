import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { cn } from "cnfast";
import type { ComponentProps, CSSProperties } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useDeclareBlock } from "~/features/study/hooks/use-declare-block";
import { useUpdateBlock } from "~/features/study/hooks/use-update-block";
import {
  type DeclareBlockFormInput,
  DeclareBlockSchema,
} from "~/features/study/schemas/declare-block-schema";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
  type SessionCategory,
} from "~/types/dashboard";
import { todayJst } from "~/utils/date-jst";
import { dayjs } from "~/utils/dayjs";
import { holidayName } from "~/utils/holiday";

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as SessionCategory[];
const SATURDAY_COLOR = "var(--blue)";
const DATE_TIME_INPUT_COLOR = "var(--tx)";
const TIME_INPUT_COLOR = "var(--bg)";
const DATE_TIME_PLACEHOLDER_COLOR = "color-mix(in oklab, var(--tx) 72%, var(--dim))";

const DATE_TIME_PICKER_CLASS_NAMES = {
  calendarHeaderControl: "lp-dtp-calendar-control",
  calendarHeaderLevel: "lp-dtp-calendar-level",
  day: "lp-dtp-day",
  input: "lp-dtp-input",
  monthsListControl: "lp-dtp-months-list-control",
  placeholder: "lp-dtp-placeholder",
  submitButton: "lp-dtp-submit",
  timeInput: "lp-dtp-time-input",
  weekday: "lp-dtp-weekday",
  yearsListControl: "lp-dtp-years-list-control",
} as const satisfies ComponentProps<typeof DateTimePicker>["classNames"];

const DATE_TIME_PICKER_STYLES = {
  calendarHeaderControl: { color: "var(--tx)" },
  calendarHeaderLevel: { color: "var(--tx)", fontWeight: 700 },
  day: { color: "var(--tx)" },
  input: {
    backgroundColor: "var(--inset)",
    borderColor: "var(--bd2)",
    color: DATE_TIME_INPUT_COLOR,
  },
  monthsListControl: { color: "var(--tx)" },
  placeholder: { color: DATE_TIME_PLACEHOLDER_COLOR },
  submitButton: { color: "var(--tx)" },
  timeInput: { color: DATE_TIME_INPUT_COLOR },
  weekday: { color: "var(--faint)" },
  yearsListControl: { color: "var(--tx)" },
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

const TIME_PICKER_PROPS = {
  classNames: {
    control: "lp-dtp-time-control",
    dropdown: "lp-dtp-time-dropdown",
    field: "lp-dtp-time-field",
    fieldsGroup: "lp-dtp-time-fields-group",
    fieldsRoot: "lp-dtp-time-fields-root",
  },
  popoverProps: { withinPortal: false },
  styles: {
    control: { color: "var(--tx)" },
    dropdown: {
      backgroundColor: "var(--panel)",
      borderColor: "var(--bd2)",
      color: "var(--tx)",
    },
    field: { color: TIME_INPUT_COLOR },
    fieldsGroup: { color: TIME_INPUT_COLOR },
    fieldsRoot: { color: TIME_INPUT_COLOR },
  },
  withDropdown: true,
} as const satisfies ComponentProps<typeof DateTimePicker>["timePickerProps"];

type EditableBlock = Pick<Doc<"studyBlocks">, "_id" | "category" | "dateJst" | "endHm" | "startHm">;

type DeclareBlockFormProps = {
  block?: EditableBlock;
  onDone?: () => void;
};

function initialInput(block?: EditableBlock): DeclareBlockFormInput {
  return {
    category: (block?.category as SessionCategory | undefined) ?? "toeic",
    endAt: block === undefined ? null : `${block.dateJst} ${block.endHm}:00`,
    startAt: block === undefined ? null : `${block.dateJst} ${block.startHm}:00`,
  };
}

function renderHolidayDay(
  date: Parameters<NonNullable<ComponentProps<typeof DateTimePicker>["renderDay"]>>[0],
) {
  const name = holidayName(date);
  const day = Number(date.slice(8, 10));

  return (
    <Stack align="center" gap={0} lh={1}>
      <span>{day}</span>
      {name !== null && (
        <span style={{ fontSize: 12, maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </span>
      )}
    </Stack>
  );
}

function getDayStyle(date: string): CSSProperties {
  const name = holidayName(date);
  const day = dayjs(date).day();

  if (name !== null || day === 0) {
    return { color: "var(--coral)" };
  }

  if (day === 6) {
    return { color: SATURDAY_COLOR };
  }

  return { color: "var(--tx)" };
}

function getDayProps(date: string) {
  const name = holidayName(date);

  return {
    style: getDayStyle(date),
    title: name ?? undefined,
  };
}

function getDayAriaLabel(date: string) {
  const name = holidayName(date);

  return name === null ? date : `${date} ${name}`;
}

export function DeclareBlockForm({ block, onDone }: DeclareBlockFormProps = {}) {
  // Deliberately does NOT read the blocks query — the form must render
  // instantly instead of suspending with the list.
  const declareBlock = useDeclareBlock();
  const updateBlock = useUpdateBlock();
  const declareForm = useForm({
    initialInput: initialInput(block),
    schema: DeclareBlockSchema,
  });
  const isEditing = block !== undefined;

  return (
    <Form
      of={declareForm}
      onSubmit={(output) => {
        const options = {
          onError: () => {
            notifications.show({
              color: "red",
              message: isEditing ? "予定枠の更新に失敗しました" : "枠の宣言に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: `${output.dateJst} ${output.startHm}〜${output.endHm} の学習枠を${isEditing ? "更新" : "宣言"}しました`,
              title: isEditing ? "更新しました" : "宣言しました",
            });
            onDone?.();
          },
        };

        if (isEditing) {
          updateBlock.mutate({ ...output, blockId: block._id }, options);
        } else {
          declareBlock.mutate(output, options);
        }
      }}
    >
      <Stack gap="md">
        <Stack gap={6}>
          <Text
            component="span"
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            カテゴリ
          </Text>
          <Field of={declareForm} path={["category"]}>
            {(field) => (
              <Group gap={8} wrap="wrap">
                {CATEGORY_VALUES.map((category) => {
                  const isActive = field.input === category;

                  return (
                    <UnstyledButton
                      key={category}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => field.onChange(category)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs hover:brightness-120",
                        isActive
                          ? cn(
                              ACCENT_CLASSES.good.border,
                              ACCENT_CLASSES.good.bg,
                              ACCENT_CLASSES.good.text,
                              "font-semibold",
                            )
                          : "border-bd-2 bg-inset text-dim font-medium",
                      )}
                      disabled={declareForm.isSubmitting}
                    >
                      {CATEGORY_LABELS[category]}
                    </UnstyledButton>
                  );
                })}
              </Group>
            )}
          </Field>
        </Stack>

        <Group gap="md" grow>
          <Field of={declareForm} path={["startAt"]}>
            {(field) => (
              <DateTimePicker
                classNames={DATE_TIME_PICKER_CLASS_NAMES}
                error={field.errors?.[0]}
                getDayAriaLabel={getDayAriaLabel}
                getDayProps={getDayProps}
                label="開始日時"
                minDate={todayJst()}
                onChange={field.onChange}
                placeholder="開始日時を選択"
                popoverProps={DATE_TIME_PICKER_POPOVER_PROPS}
                renderDay={renderHolidayDay}
                styles={DATE_TIME_PICKER_STYLES}
                timePickerProps={TIME_PICKER_PROPS}
                value={field.input}
                valueFormat="YYYY-MM-DD HH:mm"
                weekendDays={[0]}
                withSeconds={false}
                disabled={declareForm.isSubmitting}
              />
            )}
          </Field>
          <Field of={declareForm} path={["endAt"]}>
            {(field) => (
              <DateTimePicker
                classNames={DATE_TIME_PICKER_CLASS_NAMES}
                error={field.errors?.[0]}
                getDayAriaLabel={getDayAriaLabel}
                getDayProps={getDayProps}
                label="終了日時"
                minDate={todayJst()}
                onChange={field.onChange}
                placeholder="終了日時を選択"
                popoverProps={DATE_TIME_PICKER_POPOVER_PROPS}
                renderDay={renderHolidayDay}
                styles={DATE_TIME_PICKER_STYLES}
                timePickerProps={TIME_PICKER_PROPS}
                value={field.input}
                valueFormat="YYYY-MM-DD HH:mm"
                weekendDays={[0]}
                withSeconds={false}
                disabled={declareForm.isSubmitting}
              />
            )}
          </Field>
        </Group>

        <Button
          className="hover:brightness-120"
          loading={declareForm.isSubmitting}
          disabled={declareForm.isSubmitting}
          style={ACCENT_SOLID_STYLE.good}
          type="submit"
        >
          {isEditing ? "予定を更新する" : "枠を宣言する"}
        </Button>
      </Stack>
    </Form>
  );
}
