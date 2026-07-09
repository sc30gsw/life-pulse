import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { SessionError } from "./errors";
import { resolveCurrentSession } from "./resolveCurrentSession";

type PauseArgs = Pick<Doc<"interruptions">, "reason">;

export async function pause(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: PauseArgs,
): Promise<ResultType<void, SessionError>> {
  const session = await resolveCurrentSession(ctx, user._id);

  if (session === null || session.status !== "active") {
    return Result.err(new SessionError({ code: "NO_ACTIVE_SESSION" }));
  }

  const now = Date.now();
  const resumedAt = session.lastResumedAt ?? session.startedAt;

  await ctx.db.patch("studySessions", session._id, {
    accumulatedMs: session.accumulatedMs + Math.max(0, now - resumedAt),
    interruptionCount: session.interruptionCount + 1,
    status: "paused",
  });

  await ctx.db.insert("interruptions", {
    pausedAt: now,
    reason: args.reason,
    sessionId: session._id,
  });

  return Result.ok();
}
