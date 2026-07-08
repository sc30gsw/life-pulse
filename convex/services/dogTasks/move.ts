import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { listActiveDogTasks } from "./list";

type MoveDirection = "down" | "up";
type MoveArgs = { direction: MoveDirection; taskId: Doc<"dogTasks">["_id"] };

export async function move(ctx: MutationCtx, args: MoveArgs) {
  const activeTasks = await listActiveDogTasks(ctx);
  const index = activeTasks.findIndex((task) => task._id === args.taskId);

  if (index === -1) {
    throw new ConvexError("TASK_NOT_FOUND");
  }

  const swapIndex = args.direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= activeTasks.length) {
    // No-op: already at the top/bottom of the active list.
    return;
  }

  const current = activeTasks[index];
  const swapWith = activeTasks[swapIndex];

  if (current === undefined || swapWith === undefined) {
    throw new ConvexError("TASK_NOT_FOUND");
  }

  await ctx.db.patch("dogTasks", current._id, { sortOrder: swapWith.sortOrder });
  await ctx.db.patch("dogTasks", swapWith._id, { sortOrder: current.sortOrder });
}
