import { pastDateJstRange, todayJst } from "~/utils/date-jst";

export const ANALYTICS_PERIODS = [
  { days: 28, label: "28日" },
  { days: 90, label: "90日" },
] as const satisfies readonly { days: 28 | 90; label: string }[];

export type AnalyticsPeriodDays = (typeof ANALYTICS_PERIODS)[number]["days"];

export function analyticsRangeJst(days: AnalyticsPeriodDays) {
  const toDateJst = todayJst();
  const { fromDateJst } = pastDateJstRange(toDateJst, days - 1);

  return { fromDateJst, toDateJst };
}
