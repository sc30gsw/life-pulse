import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

function settingsQuery() {
  return convexQuery(api.queries.settings.get.get, {});
}

export function useSettings() {
  return useSuspenseQuery(settingsQuery());
}
