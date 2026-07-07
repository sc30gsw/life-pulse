// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import {
  DATE_TIME_PICKER_CLASS_NAMES,
  DATE_TIME_PICKER_POPOVER_PROPS,
  DATE_TIME_PICKER_STYLES,
  TIME_PICKER_PROPS,
  getDayAriaLabel,
  getDayProps,
  getDayStyle,
  renderHolidayDay,
} from "~/components/date-time-picker-style";
import { renderWithMantine } from "~/test-utils";

test("exports themed DateTimePicker class names and style props", () => {
  expect(DATE_TIME_PICKER_CLASS_NAMES.input).toBe("lp-dtp-input");
  expect(DATE_TIME_PICKER_STYLES.input?.color).toBe("var(--tx)");
  expect(DATE_TIME_PICKER_POPOVER_PROPS.styles?.dropdown?.backgroundColor).toBe("var(--panel)");
  expect(TIME_PICKER_PROPS.withDropdown).toBe(true);
});

test("colors holidays and weekends for calendar days", () => {
  expect(getDayStyle("2026-01-01")).toEqual({ color: "var(--coral)" });
  expect(getDayStyle("2026-07-12")).toEqual({ color: "var(--coral)" });
  expect(getDayStyle("2026-07-11")).toEqual({ color: "var(--blue)" });
  expect(getDayStyle("2026-07-08")).toEqual({ color: "var(--tx)" });
});

test("adds holiday metadata to day props and aria labels", () => {
  expect(getDayProps("2026-01-01")).toMatchObject({
    style: { color: "var(--coral)" },
    title: "元日",
  });
  expect(getDayProps("2026-07-08").title).toBeUndefined();
  expect(getDayAriaLabel("2026-01-01")).toBe("2026-01-01 元日");
  expect(getDayAriaLabel("2026-07-08")).toBe("2026-07-08");
});

test("renders the day number and holiday name", () => {
  const { getByText } = renderWithMantine(renderHolidayDay("2026-01-01"));

  expect(getByText("1")).toBeDefined();
  expect(getByText("元日")).toBeDefined();
});
