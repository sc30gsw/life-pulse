import { useSuspenseQuery } from "@tanstack/react-query";

import { sessionHistoryQuery } from "~/features/study/api/session-history-query";
import { pastDateJstRange, todayJst } from "~/utils/date-jst";

const HISTORY_RANGE_DAYS = 7;

export function useSessionHistory() {
  const { fromDateJst, toDateJst } = pastDateJstRange(todayJst(), HISTORY_RANGE_DAYS);

  return useSuspenseQuery(sessionHistoryQuery(fromDateJst, toDateJst)).data;
}
