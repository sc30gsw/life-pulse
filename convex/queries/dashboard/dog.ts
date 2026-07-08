import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  appUserFieldValidators,
  dogEventFieldValidators,
  dogFieldValidators,
  dogTaskFieldValidators,
} from "../../lib/validators";
import { dog as dogService } from "../../services/dashboard/dog";

export const dog = query({
  args: { dateJst: dogEventFieldValidators.dateJst },
  returns: v.union(
    v.null(),
    v.object({
      dogImageUrl: v.union(v.null(), v.string()),
      dogName: dogFieldValidators.name,
      tasks: v.array(
        v.object({
          at: v.optional(dogEventFieldValidators.at),
          byRole: v.optional(appUserFieldValidators.role),
          done: v.boolean(),
          eventId: v.optional(v.id("dogEvents")),
          name: dogTaskFieldValidators.name,
          taskId: v.id("dogTasks"),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await dogService(ctx, args);
  },
});
