import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { get as getDog } from "../dogs/get";
import { listActiveDogTasks } from "../dogTasks/list";

type DogArgs = Pick<Doc<"dogEvents">, "dateJst">;

export async function dog(ctx: QueryCtx, args: DogArgs) {
  const [dogDoc, activeTasks, rawEvents] = await Promise.all([
    getDog(ctx),
    listActiveDogTasks(ctx),
    ctx.db
      .query("dogEvents")
      .withIndex("by_date", (q) => q.eq("dateJst", args.dateJst))
      .collect(),
  ]);

  if (dogDoc === null) {
    return null;
  }

  const eventByTaskId = new Map(rawEvents.map((event) => [event.taskId, event]));

  const tasks = await Promise.all(
    activeTasks.map(async (task) => {
      const event = eventByTaskId.get(task._id);

      if (event === undefined) {
        return {
          at: undefined,
          byRole: undefined,
          done: false,
          eventId: undefined,
          name: task.name,
          taskId: task._id,
        };
      }

      const byUser = await ctx.db.get("appUsers", event.byUserId);

      return {
        at: event.at,
        // A missing appUsers row means the actor was deleted after logging
        // the event; drop byRole rather than surfacing a broken reference.
        byRole: byUser?.role,
        done: true,
        eventId: event._id,
        name: task.name,
        taskId: task._id,
      };
    }),
  );

  return { dogName: dogDoc.name, tasks };
}
