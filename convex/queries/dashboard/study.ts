import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  studyBlockDocumentValidator,
  studyBlockFieldValidators,
  studySessionDocumentValidator,
} from "../../lib/validators";
import { study as studyService } from "../../services/dashboard/study";

export const study = query({
  args: { dateJst: studyBlockFieldValidators.dateJst },
  returns: v.object({
    blocks: v.array(studyBlockDocumentValidator),
    session: v.union(v.null(), studySessionDocumentValidator),
    todayActualMinutes: studyBlockFieldValidators.plannedMinutes,
  }),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await studyService(ctx, args);
  },
});
