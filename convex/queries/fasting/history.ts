import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { fastingPhaseValidator } from "../../lib/validators";
import { history as historyService } from "../../services/fasting/history";

export const history = query({
  args: {},
  returns: v.array(
    v.object({
      _creationTime: v.number(),
      _id: v.id("fastingWindows"),
      actualMinutes: v.optional(v.number()),
      endedAt: v.optional(v.number()),
      phase: fastingPhaseValidator,
      phaseJobIds: v.array(v.id("_scheduled_functions")),
      startedAt: v.number(),
      status: v.literal("ended"),
      targetMinutes: v.number(),
      userId: v.id("appUsers"),
    }),
  ),
  handler: async (ctx) => {
    await requireUser(ctx);

    return await historyService(ctx);
  },
});
