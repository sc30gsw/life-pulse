import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { studyBlockDocumentValidator, studyBlockFieldValidators } from "../../lib/validators";
import { todayWithSuggestions as todayWithSuggestionsService } from "../../services/blocks/todayWithSuggestions";

export const todayWithSuggestions = query({
  args: {
    dateJst: studyBlockFieldValidators.dateJst,
    nowHm: studyBlockFieldValidators.startHm,
  },
  returns: v.object({
    blocks: v.array(studyBlockDocumentValidator),
    suggestions: v.array(studyBlockFieldValidators.startHm),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await todayWithSuggestionsService(ctx, user, args);
  },
});
