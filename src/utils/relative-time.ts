import { TIME_CONSTANTS } from "~/utils/time-constants";

export function formatRelativeTime(pastMs: number, nowMs: number) {
  const deltaSeconds = Math.max(0, Math.floor((nowMs - pastMs) / TIME_CONSTANTS.SECOND_MS));

  if (deltaSeconds < TIME_CONSTANTS.JUST_NOW_THRESHOLD_SECONDS) {
    return "たった今";
  }

  if (deltaSeconds < TIME_CONSTANTS.MINUTE_SECONDS) {
    return `${deltaSeconds}秒前`;
  }

  if (deltaSeconds < TIME_CONSTANTS.HOUR_SECONDS) {
    return `${Math.floor(deltaSeconds / TIME_CONSTANTS.MINUTE_SECONDS)}分前`;
  }

  if (deltaSeconds < TIME_CONSTANTS.DAY_SECONDS) {
    return `${Math.floor(deltaSeconds / TIME_CONSTANTS.HOUR_SECONDS)}時間前`;
  }

  return `${Math.floor(deltaSeconds / TIME_CONSTANTS.DAY_SECONDS)}日前`;
}
