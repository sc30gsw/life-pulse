import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export async function end(ctx: MutationCtx, user: Doc<"appUsers">) {
  const window = await ctx.db
    .query("fastingWindows")
    .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "fasting"))
    .first();

  if (window === null) {
    throw new ConvexError("FASTING_NOT_ACTIVE");
  }

  const now = Date.now();
  const actualMinutes = Math.floor((now - window.startedAt) / 60_000);

  for (const jobId of window.phaseJobIds) {
    await ctx.scheduler.cancel(jobId);
  }

  await ctx.db.patch("fastingWindows", window._id, {
    actualMinutes,
    endedAt: now,
    status: "ended",
  });
}
