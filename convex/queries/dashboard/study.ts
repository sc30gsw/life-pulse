import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  blockStatusValidator,
  categoryValidator,
  erosionReasonValidator,
  sessionStatusValidator,
} from "../../lib/validators";
import { study as studyService } from "../../services/dashboard/study";

export const study = query({
  args: { dateJst: v.string() },
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
    session: v.union(
      v.null(),
      v.object({
        _creationTime: v.number(),
        _id: v.id("studySessions"),
        abandonJobId: v.optional(v.id("_scheduled_functions")),
        accumulatedMs: v.number(),
        blockId: v.optional(v.id("studyBlocks")),
        category: categoryValidator,
        dateJst: v.string(),
        endedAt: v.optional(v.number()),
        interruptionCount: v.number(),
        lastResumedAt: v.optional(v.number()),
        plannedMinutes: v.optional(v.number()),
        startedAt: v.number(),
        status: sessionStatusValidator,
        userId: v.id("appUsers"),
      }),
    ),
    todayActualMinutes: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await studyService(ctx, args);
  },
});
