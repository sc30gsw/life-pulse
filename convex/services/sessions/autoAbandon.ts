import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type AutoAbandonArgs = Record<"sessionId", Id<"studySessions">>;

export async function autoAbandon(ctx: MutationCtx, args: AutoAbandonArgs) {
  const session = await ctx.db.get("studySessions", args.sessionId);

  if (session === null || !isAbandonable(session.status)) {
    return;
  }

  const now = Date.now();
  const accumulatedMs =
    session.status === "active"
      ? session.accumulatedMs + Math.max(0, now - (session.lastResumedAt ?? session.startedAt))
      : session.accumulatedMs;

  await ctx.db.patch("studySessions", session._id, {
    accumulatedMs,
    endedAt: now,
    status: "abandoned",
  });
}

function isAbandonable(status: Doc<"studySessions">["status"]) {
  return status === "active" || status === "paused";
}
