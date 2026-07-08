import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  creationTimeValidator,
  endedFastingStatusValidator,
  fastingWindowFieldValidators,
} from "../../lib/validators";
import { history as historyService } from "../../services/fasting/history";

export const history = query({
  args: {},
  returns: v.array(
    v.object({
      _creationTime: creationTimeValidator,
      _id: v.id("fastingWindows"),
      ...fastingWindowFieldValidators,
      status: endedFastingStatusValidator,
    }),
  ),
  handler: async (ctx) => {
    await requireUser(ctx);

    return await historyService(ctx);
  },
});
