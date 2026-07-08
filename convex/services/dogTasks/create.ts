import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type CreateArgs = Pick<Doc<"dogTasks">, "name">;

export async function create(ctx: MutationCtx, args: CreateArgs) {
  const name = args.name.trim();

  if (name.length === 0) {
    throw new ConvexError("INVALID_NAME");
  }

  // Look across ALL tasks (active or archived) so a sortOrder value is never
  // reused once a task has been archived.
  const allTasks = await ctx.db.query("dogTasks").collect();
  const maxSortOrder = allTasks.reduce((max, task) => Math.max(max, task.sortOrder), -1);

  return await ctx.db.insert("dogTasks", {
    archivedAt: undefined,
    name,
    sortOrder: maxSortOrder + 1,
  });
}
