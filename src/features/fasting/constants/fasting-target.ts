export const DEFAULT_FASTING_TARGET_MINUTES = 960;
export const MAX_FASTING_TARGET_MINUTES = 960;
export const MIN_FASTING_TARGET_MINUTES = 1;

export function formatFastingTargetMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}分`;
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  return remainderMinutes === 0 ? `${hours}時間` : `${hours}時間${remainderMinutes}分`;
}
