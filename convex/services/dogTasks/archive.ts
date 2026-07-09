import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogTaskError } from "./errors";

type ArchiveArgs = { taskId: Doc<"dogTasks">["_id"] };

export async function archive(
  ctx: MutationCtx,
  args: ArchiveArgs,
): Promise<ResultType<void, DogTaskError>> {
  const task = await ctx.db.get("dogTasks", args.taskId);

  if (task === null) {
    return Result.err(new DogTaskError({ code: "TASK_NOT_FOUND", taskId: args.taskId }));
  }

  if (task.archivedAt !== undefined) {
    // Idempotent: archiving an already-archived task is a harmless no-op.
    return Result.ok();
  }

  await ctx.db.patch("dogTasks", args.taskId, { archivedAt: Date.now() });

  return Result.ok();
}
