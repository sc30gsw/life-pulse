import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { update as updateSettings } from "../../services/settings/update";

export const update = mutation({
  args: { dogName: v.optional(v.string()), fastingDefaultMinutes: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    await updateSettings(ctx, args);

    return null;
  },
});
