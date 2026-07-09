import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogEventError } from "./errors";

type UndoEventArgs = {
  dateJst: Doc<"dogEvents">["dateJst"];
  eventId: Doc<"dogEvents">["_id"];
};

export async function undoEvent(
  ctx: MutationCtx,
  args: UndoEventArgs,
): Promise<ResultType<void, DogEventError>> {
  const event = await ctx.db.get("dogEvents", args.eventId);

  if (event === null || event.dateJst !== args.dateJst) {
    // FR-5.2: 所有者チェックではなく、古いクライアントが別日のイベントを誤って取り消すのを防ぐガード
    return Result.err(new DogEventError({ code: "NOT_TODAY", eventId: args.eventId }));
  }

  await ctx.db.delete("dogEvents", args.eventId);

  return Result.ok();
}
