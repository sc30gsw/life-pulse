import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { setImage as setDogImage } from "../../services/dogs/setImage";

export const setImage = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    unwrapConvexResult(await setDogImage(ctx, args.storageId));

    return null;
  },
});
