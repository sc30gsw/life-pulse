import {
  DEFAULT_FASTING_MINUTES,
  MAX_FASTING_TARGET_MINUTES,
  MIN_FASTING_TARGET_MINUTES,
} from "~/../convex/lib/domain";

export { MAX_FASTING_TARGET_MINUTES, MIN_FASTING_TARGET_MINUTES };
export const DEFAULT_FASTING_TARGET_MINUTES = DEFAULT_FASTING_MINUTES;

export function formatFastingTargetMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}分`;
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  return remainderMinutes === 0 ? `${hours}時間` : `${hours}時間${remainderMinutes}分`;
}
