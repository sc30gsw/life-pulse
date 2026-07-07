import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type LogEventArgs = Pick<Doc<"dogEvents">, "dateJst" | "kind">;

export async function logEvent(ctx: MutationCtx, user: Doc<"appUsers">, args: LogEventArgs) {
  const eventsToday = await ctx.db
    .query("dogEvents")
    .withIndex("by_date", (q) => q.eq("dateJst", args.dateJst))
    .collect();

  if (eventsToday.some((event) => event.kind === args.kind)) {
    // FR-5.3: 誰が記録したかに関わらず、当日・同種の二重ログを拒否する
    throw new ConvexError("ALREADY_DONE");
  }

  return await ctx.db.insert("dogEvents", {
    kind: args.kind,
    byUserId: user._id,
    at: Date.now(),
    dateJst: args.dateJst,
  });
}
