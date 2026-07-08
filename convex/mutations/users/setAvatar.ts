import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { setAvatar as setAvatarService } from "../../services/users/setAvatar";

export const setAvatar = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // requireUser (not requireSelf): each user edits their OWN avatar —
    // self and partner both operate on their own appUsers row.
    const user = await requireUser(ctx);

    await setAvatarService(ctx, user, args.storageId);

    return null;
  },
});
