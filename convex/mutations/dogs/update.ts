import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { dogFieldValidators } from "../../lib/validators";
import { update as updateDog } from "../../services/dogs/update";

export const update = mutation({
  args: { name: dogFieldValidators.name },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    unwrapConvexResult(await updateDog(ctx, args));

    return null;
  },
});
