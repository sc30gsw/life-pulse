import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type UndoEventArgs = {
  dateJst: Doc<"dogEvents">["dateJst"];
  eventId: Id<"dogEvents">;
};

export async function undoEvent(ctx: MutationCtx, args: UndoEventArgs) {
  const event = await ctx.db.get("dogEvents", args.eventId);

  if (event === null || event.dateJst !== args.dateJst) {
    // FR-5.2: 所有者チェックではなく、古いクライアントが別日のイベントを誤って取り消すのを防ぐガード
    throw new ConvexError("NOT_TODAY");
  }

  await ctx.db.delete("dogEvents", args.eventId);
}
