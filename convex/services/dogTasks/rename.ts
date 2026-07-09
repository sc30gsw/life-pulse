import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogTaskError } from "./errors";

type RenameArgs = Pick<Doc<"dogTasks">, "name"> & { taskId: Doc<"dogTasks">["_id"] };

export async function rename(
  ctx: MutationCtx,
  args: RenameArgs,
): Promise<ResultType<void, DogTaskError>> {
  const name = args.name.trim();

  if (name.length === 0) {
    return Result.err(new DogTaskError({ code: "INVALID_NAME", taskId: args.taskId }));
  }

  const task = await ctx.db.get("dogTasks", args.taskId);

  if (task === null) {
    return Result.err(new DogTaskError({ code: "TASK_NOT_FOUND", taskId: args.taskId }));
  }

  await ctx.db.patch("dogTasks", args.taskId, { name });

  return Result.ok();
}
