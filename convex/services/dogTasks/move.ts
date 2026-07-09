import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogTaskError } from "./errors";
import { listActiveDogTasks } from "./list";

type MoveDirection = "down" | "up";
type MoveArgs = {
  direction?: MoveDirection;
  targetTaskId?: Doc<"dogTasks">["_id"];
  taskId: Doc<"dogTasks">["_id"];
};

export async function move(ctx: MutationCtx, args: MoveArgs): Promise<ResultType<void, DogTaskError>> {
  const activeTasks = await listActiveDogTasks(ctx);
  const index = activeTasks.findIndex((task) => task._id === args.taskId);

  if (index === -1) {
    return Result.err(new DogTaskError({ code: "TASK_NOT_FOUND", taskId: args.taskId }));
  }

  if (args.targetTaskId !== undefined) {
    const targetIndex = activeTasks.findIndex((task) => task._id === args.targetTaskId);

    if (targetIndex === -1) {
      return Result.err(
        new DogTaskError({
          code: "TASK_NOT_FOUND",
          taskId: args.taskId,
          targetTaskId: args.targetTaskId,
        }),
      );
    }

    if (targetIndex === index) {
      return Result.ok();
    }

    const [current] = activeTasks.splice(index, 1);

    if (current === undefined) {
      return Result.err(new DogTaskError({ code: "TASK_NOT_FOUND", taskId: args.taskId }));
    }

    const adjustedTargetIndex = activeTasks.findIndex((task) => task._id === args.targetTaskId);
    activeTasks.splice(
      index < targetIndex ? adjustedTargetIndex + 1 : adjustedTargetIndex,
      0,
      current,
    );

    await Promise.all(
      activeTasks.map((task, sortOrder) => ctx.db.patch("dogTasks", task._id, { sortOrder })),
    );
    return Result.ok();
  }

  if (args.direction === undefined) {
    return Result.err(new DogTaskError({ code: "MOVE_TARGET_REQUIRED", taskId: args.taskId }));
  }

  const swapIndex = args.direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= activeTasks.length) {
    // No-op: already at the top/bottom of the active list.
    return Result.ok();
  }

  const current = activeTasks[index];
  const swapWith = activeTasks[swapIndex];

  if (current === undefined || swapWith === undefined) {
    return Result.err(new DogTaskError({ code: "TASK_NOT_FOUND", taskId: args.taskId }));
  }

  await ctx.db.patch("dogTasks", current._id, { sortOrder: swapWith.sortOrder });
  await ctx.db.patch("dogTasks", swapWith._id, { sortOrder: current.sortOrder });

  return Result.ok();
}
