import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { resolveCurrentSession } from "./resolveCurrentSession";

export async function complete(ctx: MutationCtx, user: Doc<"appUsers">) {
  const session = await resolveCurrentSession(ctx, user._id);

  if (session === null) {
    throw new ConvexError("NO_ACTIVE_SESSION");
  }

  const now = Date.now();
  const accumulatedMs =
    session.status === "active"
      ? session.accumulatedMs + Math.max(0, now - (session.lastResumedAt ?? session.startedAt))
      : session.accumulatedMs;

  await ctx.db.patch("studySessions", session._id, {
    accumulatedMs,
    endedAt: now,
    status: "completed",
  });

  if (session.abandonJobId !== undefined) {
    await ctx.scheduler.cancel(session.abandonJobId);
  }

  if (session.blockId !== undefined) {
    await ctx.db.patch("studyBlocks", session.blockId, { status: "done" });
  }
}
