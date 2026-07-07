import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { resume as resumeSession } from "../../services/sessions/resume";

export const resume = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await resumeSession(ctx, user);

    return null;
  },
});
