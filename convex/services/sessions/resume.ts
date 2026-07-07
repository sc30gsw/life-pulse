import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { resolveCurrentSession } from "./resolveCurrentSession";

export async function resume(ctx: MutationCtx, user: Doc<"appUsers">) {
  const session = await resolveCurrentSession(ctx, user._id);

  if (session === null || session.status !== "paused") {
    throw new ConvexError("NO_PAUSED_SESSION");
  }

  const now = Date.now();

  await ctx.db.patch("studySessions", session._id, {
    lastResumedAt: now,
    status: "active",
  });

  const openInterruption = await ctx.db
    .query("interruptions")
    .withIndex("by_session", (q) => q.eq("sessionId", session._id))
    .order("desc")
    .first();

  if (openInterruption !== null && openInterruption.resumedAt === undefined) {
    await ctx.db.patch("interruptions", openInterruption._id, { resumedAt: now });
  }
}
