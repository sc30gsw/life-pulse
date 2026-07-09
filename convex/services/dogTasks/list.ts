import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function listActiveDogTasks(ctx: QueryCtx | MutationCtx) {
  const tasks = await ctx.db.query("dogTasks").collect();

  return tasks
    .filter((task) => task.archivedAt === undefined)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
