import { sortBy } from "remeda";

import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { addDaysJst, assertDateJst } from "../../lib/date-range";

type UpcomingArgs = Record<"todayJst", Doc<"studyBlocks">["dateJst"]>;

export async function upcoming(ctx: QueryCtx, user: Doc<"appUsers">, args: UpcomingArgs) {
  assertDateJst(args.todayJst);

  const blocks = await ctx.db
    .query("studyBlocks")
    .withIndex("by_user_date", (q) =>
      q
        .eq("userId", user._id)
        .gt("dateJst", args.todayJst)
        .lte("dateJst", addDaysJst(args.todayJst, 30)),
    )
    .collect();

  return sortBy(
    blocks.filter((block) => block.status === "planned"),
    (block) => block.dateJst,
    (block) => block.startHm,
  );
}
