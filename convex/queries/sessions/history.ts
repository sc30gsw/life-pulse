import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { categoryValidator, sessionStatusValidator } from "../../lib/validators";
import { history as historyService } from "../../services/sessions/history";

export const history = query({
  args: { fromDateJst: v.string(), toDateJst: v.string() },
  returns: v.object({
    days: v.array(
      v.object({
        dateJst: v.string(),
        sessions: v.array(
          v.object({
            actualMinutes: v.number(),
            category: categoryValidator,
            id: v.id("studySessions"),
            interruptionCount: v.number(),
            startedAt: v.number(),
            status: sessionStatusValidator,
          }),
        ),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await historyService(ctx, user, args);
  },
});
