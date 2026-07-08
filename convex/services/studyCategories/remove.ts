import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { archive } from "./archive";

type RemoveArgs = Record<"categoryId", Doc<"studyCategories">["_id"]>;

async function hasCategoryUsage(ctx: MutationCtx, categoryId: Doc<"studyCategories">["_id"]) {
  const [block, session] = await Promise.all([
    ctx.db
      .query("studyBlocks")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
      .first(),
    ctx.db
      .query("studySessions")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
      .first(),
  ]);

  return block !== null || session !== null;
}

export async function remove(ctx: MutationCtx, user: Doc<"appUsers">, args: RemoveArgs) {
  const category = await ctx.db.get(args.categoryId);

  if (category === null || category.userId !== user._id) {
    throw new ConvexError("CATEGORY_NOT_FOUND");
  }

  if (await hasCategoryUsage(ctx, args.categoryId)) {
    await archive(ctx, user, args);
    return "archived";
  }

  await ctx.db.delete(args.categoryId);
  return "deleted";
}
