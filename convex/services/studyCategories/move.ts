import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { listActiveStudyCategories } from "./list";

type MoveDirection = "down" | "up";
type MoveArgs = { categoryId: Doc<"studyCategories">["_id"]; direction: MoveDirection };

export async function move(ctx: MutationCtx, user: Doc<"appUsers">, args: MoveArgs) {
  const activeCategories = await listActiveStudyCategories(ctx, user);
  const index = activeCategories.findIndex((category) => category._id === args.categoryId);

  if (index === -1) {
    throw new ConvexError("CATEGORY_NOT_FOUND");
  }

  const swapIndex = args.direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= activeCategories.length) {
    return;
  }

  const current = activeCategories[index];
  const swapWith = activeCategories[swapIndex];

  if (current === undefined || swapWith === undefined) {
    throw new ConvexError("CATEGORY_NOT_FOUND");
  }

  await ctx.db.patch("studyCategories", current._id, { sortOrder: swapWith.sortOrder });
  await ctx.db.patch("studyCategories", swapWith._id, { sortOrder: current.sortOrder });
}
