import holiday_jp from "@holiday-jp/holiday_jp";
import { DateTimePicker } from "@mantine/dates";
import type { ComponentProps } from "react";

import { dayjs } from "~/utils/dayjs";

export function holidayName(
  dateStr: Parameters<NonNullable<ComponentProps<typeof DateTimePicker>["renderDay"]>>[0],
) {
  const date = dayjs.tz(dateStr, "Asia/Tokyo").toDate();

  return holiday_jp.between(date, date)[0]?.name ?? null;
}
