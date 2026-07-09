import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { updateDisplayName as updateDisplayNameService } from "../../services/users/updateDisplayName";

export const updateDisplayName = mutation({
  args: { displayName: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // requireUser (not requireSelf): each user edits their OWN display name.
    const user = await requireUser(ctx);

    unwrapConvexResult(await updateDisplayNameService(ctx, user, args.displayName));

    return null;
  },
});
