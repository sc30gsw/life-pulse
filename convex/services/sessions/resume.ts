import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { SessionError } from "./errors";
import { resolveCurrentSession } from "./resolveCurrentSession";

export async function resume(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
): Promise<ResultType<void, SessionError>> {
  const session = await resolveCurrentSession(ctx, user._id);

  if (session === null || session.status !== "paused") {
    return Result.err(new SessionError({ code: "NO_PAUSED_SESSION" }));
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

  return Result.ok();
}
