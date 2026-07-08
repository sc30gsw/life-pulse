import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { tick as tickDemo } from "../../services/demo/tick";

export const tick = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await tickDemo(ctx);

    return null;
  },
});
