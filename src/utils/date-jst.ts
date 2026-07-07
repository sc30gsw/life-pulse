import { dayjs } from "~/utils/dayjs";

export function toDateJst(epochMs: number) {
  return dayjs(epochMs).tz("Asia/Tokyo").format("YYYY-MM-DD");
}

export function todayJst() {
  return toDateJst(Date.now());
}

export function pastDateJstRange(baseDateJst: string, days: number) {
  const anchor = dayjs.tz(baseDateJst, "Asia/Tokyo");

  return {
    fromDateJst: anchor.subtract(days, "day").format("YYYY-MM-DD"),
    toDateJst: anchor.subtract(1, "day").format("YYYY-MM-DD"),
  };
}
