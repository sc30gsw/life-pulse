import { Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { ComponentProps, CSSProperties } from "react";

import { dayjs } from "~/utils/dayjs";
import { holidayName } from "~/utils/holiday";

const SATURDAY_COLOR = "var(--blue)";
const DATE_TIME_INPUT_COLOR = "var(--tx)";
const TIME_INPUT_COLOR = "var(--bg)";
const DATE_TIME_PLACEHOLDER_COLOR = "color-mix(in oklab, var(--tx) 72%, var(--dim))";

export const DATE_TIME_PICKER_CLASS_NAMES = {
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

export const DATE_TIME_PICKER_STYLES = {
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

export const DATE_TIME_PICKER_POPOVER_PROPS = {
  styles: {
    dropdown: {
      backgroundColor: "var(--panel)",
      borderColor: "var(--bd2)",
      color: "var(--tx)",
    },
  },
} as const satisfies ComponentProps<typeof DateTimePicker>["popoverProps"];

export const TIME_PICKER_PROPS = {
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

export function renderHolidayDay(
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

export function getDayStyle(date: string): CSSProperties {
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

export function getDayProps(date: string) {
  const name = holidayName(date);

  return {
    style: getDayStyle(date),
    title: name ?? undefined,
  };
}

export function getDayAriaLabel(date: string) {
  const name = holidayName(date);

  return name === null ? date : `${date} ${name}`;
}
