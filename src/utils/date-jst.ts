import { dayjs } from "~/utils/dayjs";

export function toDateJst(epochMs: number) {
  return dayjs(epochMs).tz("Asia/Tokyo").format("YYYY-MM-DD");
}

export function todayJst() {
  return toDateJst(Date.now());
}
