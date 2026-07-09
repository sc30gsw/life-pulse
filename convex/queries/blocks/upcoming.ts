import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { studyBlockDocumentValidator, studyBlockFieldValidators } from "../../lib/validators";
import { upcoming as upcomingService } from "../../services/blocks/upcoming";

export const upcoming = query({
  args: { todayJst: studyBlockFieldValidators.dateJst },
  returns: v.array(studyBlockDocumentValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await upcomingService(ctx, user, args);
  },
});
