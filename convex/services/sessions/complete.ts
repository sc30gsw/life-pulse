import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { SessionError } from "./errors";
import { resolveCurrentSession } from "./resolveCurrentSession";

export async function complete(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
): Promise<ResultType<void, SessionError>> {
  const session = await resolveCurrentSession(ctx, user._id);

  if (session === null) {
    return Result.err(new SessionError({ code: "NO_ACTIVE_SESSION" }));
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

  return Result.ok();
}
