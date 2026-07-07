import { useSuspenseQuery } from "@tanstack/react-query";

import { fastingCurrentQuery } from "~/features/fasting/api/fasting-current-query";

export function useFastingWindow() {
  return useSuspenseQuery(fastingCurrentQuery());
}
