import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { removeAvatar as removeAvatarService } from "../../services/users/removeAvatar";

export const removeAvatar = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // requireUser (not requireSelf): each user edits their OWN avatar —
    // self and partner both operate on their own appUsers row.
    const user = await requireUser(ctx);

    unwrapConvexResult(await removeAvatarService(ctx, user));

    return null;
  },
});
