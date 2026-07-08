import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogEventFieldValidators } from "../../lib/validators";
import { logEvent as logDogEvent } from "../../services/dog/logEvent";

export const logEvent = mutation({
  args: { dateJst: dogEventFieldValidators.dateJst, taskId: dogEventFieldValidators.taskId },
  returns: v.id("dogEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await logDogEvent(ctx, user, args);
  },
});
