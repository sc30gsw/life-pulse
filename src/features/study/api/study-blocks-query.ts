import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type BlocksQueryArgs = FunctionArgs<
  typeof api.queries.blocks.todayWithSuggestions.todayWithSuggestions
>;

export function studyBlocksQuery(
  dateJst: BlocksQueryArgs["dateJst"],
  nowHm: BlocksQueryArgs["nowHm"],
) {
  return convexQuery(api.queries.blocks.todayWithSuggestions.todayWithSuggestions, {
    dateJst,
    nowHm,
  });
}
