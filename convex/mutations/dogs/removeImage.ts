import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { removeImage as removeDogImage } from "../../services/dogs/removeImage";

export const removeImage = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireUser(ctx);
    unwrapConvexResult(await removeDogImage(ctx));

    return null;
  },
});
