import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  appUserFieldValidators,
  dogEventFieldValidators,
  dogTaskFieldValidators,
} from "../../lib/validators";
import { history as historyService } from "../../services/dog/history";

const dayCountValidator = v.number();
const eventCountValidator = v.number();

export const history = query({
  args: {
    fromDateJst: dogEventFieldValidators.dateJst,
    includeOlderDays: v.optional(v.boolean()),
    toDateJst: dogEventFieldValidators.dateJst,
  },
  returns: v.object({
    days: v.array(
      v.object({
        dateJst: dogEventFieldValidators.dateJst,
        events: v.array(
          v.object({
            at: dogEventFieldValidators.at,
            byDisplayName: appUserFieldValidators.displayName,
            id: v.id("dogEvents"),
            taskName: dogTaskFieldValidators.name,
          }),
        ),
      }),
    ),
    summary: v.object({
      eventCount: eventCountValidator,
      hasOlderDays: v.boolean(),
      olderDayCount: dayCountValidator,
      totalDayCount: dayCountValidator,
    }),
  }),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await historyService(ctx, args);
  },
});
