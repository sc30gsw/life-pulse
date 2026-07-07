import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { blockStatusValidator, erosionReasonValidator } from "../../lib/validators";
import { todayWithSuggestions as todayWithSuggestionsService } from "../../services/blocks/todayWithSuggestions";

export const todayWithSuggestions = query({
  args: { dateJst: v.string(), nowHm: v.string() },
  returns: v.object({
    blocks: v.array(
      v.object({
        _creationTime: v.number(),
        _id: v.id("studyBlocks"),
        category: v.string(),
        dateJst: v.string(),
        endHm: v.string(),
        erosionReason: v.optional(erosionReasonValidator),
        plannedMinutes: v.number(),
        rescheduledToId: v.optional(v.id("studyBlocks")),
        source: v.union(v.literal("manual"), v.literal("suggested")),
        startHm: v.string(),
        status: blockStatusValidator,
        userId: v.id("appUsers"),
      }),
    ),
    suggestions: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await todayWithSuggestionsService(ctx, user, args);
  },
});
