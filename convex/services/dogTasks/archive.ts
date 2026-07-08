import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type ArchiveArgs = { taskId: Doc<"dogTasks">["_id"] };

export async function archive(ctx: MutationCtx, args: ArchiveArgs) {
  const task = await ctx.db.get("dogTasks", args.taskId);

  if (task === null) {
    throw new ConvexError("TASK_NOT_FOUND");
  }

  if (task.archivedAt !== undefined) {
    // Idempotent: archiving an already-archived task is a harmless no-op.
    return;
  }

  await ctx.db.patch("dogTasks", args.taskId, { archivedAt: Date.now() });
}
