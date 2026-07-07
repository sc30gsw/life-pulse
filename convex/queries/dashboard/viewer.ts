import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { roleValidator } from "../../lib/validators";
import { viewer as viewerService } from "../../services/dashboard/viewer";

export const viewer = query({
  args: {},
  returns: v.object({
    displayName: v.string(),
    role: roleValidator,
  }),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return viewerService(user);
  },
});
