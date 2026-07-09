import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { studyCategoryDocumentValidator } from "../../lib/validators";
import { listStudyCategories } from "../../services/studyCategories/list";

export const list = query({
  args: {},
  returns: v.array(studyCategoryDocumentValidator),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await listStudyCategories(ctx, user);
  },
});
