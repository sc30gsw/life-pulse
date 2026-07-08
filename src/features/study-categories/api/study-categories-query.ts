import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function studyCategoriesQuery() {
  return convexQuery(api.queries.studyCategories.list.list, {});
}
