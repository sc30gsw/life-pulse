import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { suggestRescheduleSlots } from "./suggestRescheduleSlots";

type TodayWithSuggestionsArgs = Pick<Doc<"studyBlocks">, "dateJst"> &
  Record<"nowHm", Doc<"studyBlocks">["startHm"] | Doc<"studyBlocks">["endHm"]>;

export async function todayWithSuggestions(
  ctx: QueryCtx,
  user: Doc<"appUsers">,
  args: TodayWithSuggestionsArgs,
) {
  const blocks = await ctx.db
    .query("studyBlocks")
    .withIndex("by_user_date", (q) => q.eq("userId", user._id).eq("dateJst", args.dateJst))
    .collect();

  return { blocks, suggestions: suggestRescheduleSlots(blocks, args.nowHm) };
}
