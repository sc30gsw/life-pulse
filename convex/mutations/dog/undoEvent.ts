import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogEventFieldValidators } from "../../lib/validators";
import { undoEvent as undoDogEvent } from "../../services/dog/undoEvent";

export const undoEvent = mutation({
  args: { dateJst: dogEventFieldValidators.dateJst, eventId: v.id("dogEvents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    await undoDogEvent(ctx, args);
    return null;
  },
});
