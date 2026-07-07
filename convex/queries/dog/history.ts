import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogEventKindValidator } from "../../lib/validators";
import { history as historyService } from "../../services/dog/history";

export const history = query({
  args: { fromDateJst: v.string(), toDateJst: v.string() },
  returns: v.object({
    days: v.array(
      v.object({
        dateJst: v.string(),
        events: v.array(
          v.object({
            at: v.number(),
            byDisplayName: v.string(),
            id: v.id("dogEvents"),
            kind: dogEventKindValidator,
          }),
        ),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await historyService(ctx, args);
  },
});
