import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  blockStatusValidator,
  categoryValidator,
  dogEventKindValidator,
  erosionReasonValidator,
  fastingPhaseValidator,
  healthSourceValidator,
  presenceStateValidator,
  roleValidator,
  sessionStatusValidator,
} from "../../lib/validators";
import { live as liveService } from "../../services/dashboard/live";

export const live = query({
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
    dog: v.object({
      dogName: v.string(),
      events: v.array(
        v.object({
          at: v.number(),
          byDisplayName: v.string(),
          byRole: roleValidator,
          id: v.id("dogEvents"),
          kind: dogEventKindValidator,
        }),
      ),
    }),
    fasting: v.union(
      v.null(),
      v.object({
        _creationTime: v.number(),
        _id: v.id("fastingWindows"),
        actualMinutes: v.optional(v.number()),
        endedAt: v.optional(v.number()),
        phase: fastingPhaseValidator,
        phaseJobIds: v.array(v.id("_scheduled_functions")),
        startedAt: v.number(),
        status: v.union(v.literal("fasting"), v.literal("ended")),
        targetMinutes: v.number(),
        userId: v.id("appUsers"),
      }),
    ),
    health: v.union(
      v.null(),
      v.object({
        _creationTime: v.number(),
        _id: v.id("healthMetrics"),
        bodyBattery: v.optional(v.number()),
        dateJst: v.string(),
        hrv: v.optional(v.number()),
        restingHr: v.optional(v.number()),
        sleepMinutes: v.optional(v.number()),
        sleepScore: v.optional(v.number()),
        source: healthSourceValidator,
        steps: v.optional(v.number()),
        syncedAt: v.number(),
      }),
    ),
    partnerPresence: v.union(
      v.null(),
      v.object({
        etaHm: v.optional(v.string()),
        state: presenceStateValidator,
        updatedAt: v.number(),
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
    viewer: v.object({
      displayName: v.string(),
      role: roleValidator,
    }),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await liveService(ctx, user, args);
  },
});
