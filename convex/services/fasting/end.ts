import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { FastingError } from "./errors";

export async function end(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
): Promise<ResultType<void, FastingError>> {
  const window = await ctx.db
    .query("fastingWindows")
    .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "fasting"))
    .first();

  if (window === null) {
    return Result.err(new FastingError({ code: "FASTING_NOT_ACTIVE" }));
  }

  const now = Date.now();
  const actualMinutes = Math.floor((now - window.startedAt) / 60_000);

  await Promise.all(window.phaseJobIds.map((jobId) => ctx.scheduler.cancel(jobId)));

  await ctx.db.patch("fastingWindows", window._id, {
    actualMinutes,
    endedAt: now,
    status: "ended",
  });

  return Result.ok();
}
