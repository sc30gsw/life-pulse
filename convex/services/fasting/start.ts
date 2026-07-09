import { Result, type Result as ResultType } from "better-result";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { getFastingDefaultMinutes } from "../appSettings/getFastingDefaultMinutes";
import { FastingError } from "./errors";
import { phaseSchedule } from "./phaseSchedule";

type StartArgs = Partial<Pick<Doc<"fastingWindows">, "targetMinutes">>;

export async function start(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: StartArgs,
): Promise<ResultType<Doc<"fastingWindows">["_id"], FastingError>> {
  const existing = await ctx.db
    .query("fastingWindows")
    .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "fasting"))
    .first();

  if (existing !== null) {
    return Result.err(new FastingError({ code: "FASTING_EXISTS" }));
  }

  if (
    args.targetMinutes !== undefined &&
    (!Number.isInteger(args.targetMinutes) || args.targetMinutes <= 0)
  ) {
    return Result.err(new FastingError({ code: "INVALID_TARGET" }));
  }

  const target = args.targetMinutes ?? (await getFastingDefaultMinutes(ctx));
  const schedule = phaseSchedule(target);

  const windowId = await ctx.db.insert("fastingWindows", {
    phase: "early",
    phaseJobIds: [],
    startedAt: Date.now(),
    status: "fasting",
    targetMinutes: target,
    userId: user._id,
  });

  const jobIds = await Promise.all(
    schedule.map((entry) =>
      ctx.scheduler.runAfter(
        entry.afterMinutes * 60_000,
        internal.mutations.fasting.advancePhase.advancePhase,
        { to: entry.to, windowId },
      ),
    ),
  );

  await ctx.db.patch("fastingWindows", windowId, { phaseJobIds: jobIds });

  return Result.ok(windowId);
}
