import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogEventError } from "./errors";

type LogEventArgs = Pick<Doc<"dogEvents">, "dateJst" | "taskId">;

export async function logEvent(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: LogEventArgs,
): Promise<ResultType<Doc<"dogEvents">["_id"], DogEventError>> {
  const task = await ctx.db.get("dogTasks", args.taskId);

  if (task === null || task.archivedAt !== undefined) {
    // Can't log care against a deleted (or never-existing) task.
    return Result.err(new DogEventError({ code: "TASK_NOT_FOUND", taskId: args.taskId }));
  }

  const eventsToday = await ctx.db
    .query("dogEvents")
    .withIndex("by_date", (q) => q.eq("dateJst", args.dateJst))
    .collect();

  if (eventsToday.some((event) => event.taskId === args.taskId)) {
    // FR-5.3: 誰が記録したかに関わらず、当日・同種の二重ログを拒否する
    return Result.err(new DogEventError({ code: "ALREADY_DONE", taskId: args.taskId }));
  }

  return Result.ok(
    await ctx.db.insert("dogEvents", {
      at: Date.now(),
      byUserId: user._id,
      dateJst: args.dateJst,
      taskId: args.taskId,
    }),
  );
}
