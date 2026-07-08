import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type RenameArgs = Pick<Doc<"dogTasks">, "name"> & { taskId: Doc<"dogTasks">["_id"] };

export async function rename(ctx: MutationCtx, args: RenameArgs) {
  const name = args.name.trim();

  if (name.length === 0) {
    throw new ConvexError("INVALID_NAME");
  }

  const task = await ctx.db.get("dogTasks", args.taskId);

  if (task === null) {
    throw new ConvexError("TASK_NOT_FOUND");
  }

  await ctx.db.patch("dogTasks", args.taskId, { name });
}
