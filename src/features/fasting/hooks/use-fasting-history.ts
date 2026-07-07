import { useSuspenseQuery } from "@tanstack/react-query";

import { fastingHistoryQuery } from "~/features/fasting/api/fasting-history-query";

export function useFastingHistory() {
  return useSuspenseQuery(fastingHistoryQuery());
}
