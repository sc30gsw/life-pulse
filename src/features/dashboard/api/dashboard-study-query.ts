import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type StudyQueryArgs = FunctionArgs<typeof api.queries.dashboard.study.study>;

export function dashboardStudyQuery(dateJst: StudyQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.study.study, { dateJst });
}
