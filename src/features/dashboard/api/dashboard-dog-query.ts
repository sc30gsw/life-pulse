import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type DogQueryArgs = FunctionArgs<typeof api.queries.dashboard.dog.dog>;

export function dashboardDogQuery(dateJst: DogQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.dog.dog, { dateJst });
}
