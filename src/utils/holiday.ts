import holiday_jp from "@holiday-jp/holiday_jp";
import { DateTimePicker } from "@mantine/dates";
import type { ComponentProps } from "react";

import { dayjs } from "~/utils/dayjs";

type HolidayMap = Record<string, Record<"name", string>>;

export function holidayName(
  dateStr: Parameters<NonNullable<ComponentProps<typeof DateTimePicker>["renderDay"]>>[0],
) {
  const dateKey =
    typeof dateStr === "string" ? dateStr.slice(0, 10) : dayjs(dateStr).format("YYYY-MM-DD");

  return (holiday_jp.holidays as HolidayMap)[dateKey]?.name ?? null;
}
