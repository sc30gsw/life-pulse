import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function dogQuery() {
  return convexQuery(api.queries.dogs.get.get, {});
}
