import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { blockStatusValidator, erosionReasonValidator } from "../../lib/validators";
import { upcoming as upcomingService } from "../../services/blocks/upcoming";

export const upcoming = query({
  args: { todayJst: v.string() },
  returns: v.array(
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
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await upcomingService(ctx, user, args);
  },
});
