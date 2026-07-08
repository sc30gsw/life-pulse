import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { get as getSettings } from "../../services/settings/get";

export const get = query({
  args: {},
  returns: v.object({
    demoMode: v.boolean(),
    dogName: v.string(),
    fastingDefaultMinutes: v.number(),
  }),
  handler: async (ctx) => {
    await requireSelf(ctx);

    return await getSettings(ctx);
  },
});
