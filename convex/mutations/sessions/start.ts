import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { studySessionFieldValidators } from "../../lib/validators";
import { start as startSession } from "../../services/sessions/start";
import { resolveCategoryIdForWrite } from "../../services/studyCategories/resolveForWrite";

export const start = mutation({
  args: {
    blockId: studySessionFieldValidators.blockId,
    category: studySessionFieldValidators.category,
    categoryId: studySessionFieldValidators.categoryId,
    dateJst: studySessionFieldValidators.dateJst,
    plannedMinutes: studySessionFieldValidators.plannedMinutes,
  },
  returns: v.id("studySessions"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const categoryId =
      args.blockId !== undefined && args.categoryId !== undefined
        ? args.categoryId
        : await resolveCategoryIdForWrite(ctx, user, args);

    return await startSession(ctx, user, { ...args, categoryId });
  },
});
