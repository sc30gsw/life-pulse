import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type RestoreArgs = Record<"categoryId", Doc<"studyCategories">["_id"]>;

export async function restore(ctx: MutationCtx, user: Doc<"appUsers">, args: RestoreArgs) {
  const category = await ctx.db.get(args.categoryId);

  if (category === null || category.userId !== user._id) {
    throw new ConvexError("CATEGORY_NOT_FOUND");
  }

  if (category.archivedAt === undefined) {
    return;
  }

  await ctx.db.patch(args.categoryId, { archivedAt: undefined });
}
