import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogTaskError } from "./errors";

type CreateArgs = Pick<Doc<"dogTasks">, "name">;

export async function create(
  ctx: MutationCtx,
  args: CreateArgs,
): Promise<ResultType<Doc<"dogTasks">["_id"], DogTaskError>> {
  const name = args.name.trim();

  if (name.length === 0) {
    return Result.err(new DogTaskError({ code: "INVALID_NAME" }));
  }

  // Look across ALL tasks (active or archived) so a sortOrder value is never
  // reused once a task has been archived.
  const allTasks = await ctx.db.query("dogTasks").collect();
  const maxSortOrder = allTasks.reduce((max, task) => Math.max(max, task.sortOrder), -1);

  return Result.ok(
    await ctx.db.insert("dogTasks", {
      archivedAt: undefined,
      name,
      sortOrder: maxSortOrder + 1,
    }),
  );
}
