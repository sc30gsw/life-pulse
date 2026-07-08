import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { appSettingsFieldValidators } from "../../lib/validators";
import { update as updateSettings } from "../../services/settings/update";

export const update = mutation({
  args: {
    dogName: v.optional(appSettingsFieldValidators.dogName),
    fastingDefaultMinutes: v.optional(appSettingsFieldValidators.fastingDefaultMinutes),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    await updateSettings(ctx, args);

    return null;
  },
});
