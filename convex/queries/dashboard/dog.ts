import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogEventKindValidator, roleValidator } from "../../lib/validators";
import { dog as dogService } from "../../services/dashboard/dog";

export const dog = query({
  args: { dateJst: v.string() },
  returns: v.object({
    dogName: v.string(),
    events: v.array(
      v.object({
        at: v.number(),
        byDisplayName: v.string(),
        byRole: roleValidator,
        id: v.id("dogEvents"),
        kind: dogEventKindValidator,
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await dogService(ctx, args);
  },
});
