import { ConvexError } from "convex/values";

import { internal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertDateJst } from "../../lib/dateRange";
import { assertCategoryBelongsToUser, assertCategoryIsActive } from "../studyCategories/validate";
import { resolveCurrentSession } from "./resolveCurrentSession";

const ABANDON_AFTER_MS = 6 * 60 * 60 * 1000;

type StartArgs = Pick<Doc<"studySessions">, "blockId" | "dateJst" | "plannedMinutes"> &
  Record<"categoryId", Id<"studyCategories">>;

export async function start(ctx: MutationCtx, user: Doc<"appUsers">, args: StartArgs) {
  const existing = await resolveCurrentSession(ctx, user._id);

  if (existing !== null) {
    throw new ConvexError("SESSION_EXISTS");
  }

  assertDateJst(args.dateJst);

  if (args.blockId !== undefined) {
    const block = await ctx.db.get(args.blockId);

    if (block === null || block.userId !== user._id || block.categoryId !== args.categoryId) {
      throw new ConvexError("BLOCK_NOT_FOUND");
    }

    await assertCategoryBelongsToUser(ctx, user, args.categoryId);
  } else {
    await assertCategoryIsActive(ctx, user, args.categoryId);
  }

  const now = Date.now();
  const sessionId = await ctx.db.insert("studySessions", {
    accumulatedMs: 0,
    blockId: args.blockId,
    categoryId: args.categoryId,
    dateJst: args.dateJst,
    interruptionCount: 0,
    lastResumedAt: now,
    plannedMinutes: args.plannedMinutes,
    startedAt: now,
    status: "active",
    userId: user._id,
  });

  const abandonJobId = await ctx.scheduler.runAfter(
    ABANDON_AFTER_MS,
    internal.mutations.sessions.autoAbandon.autoAbandon,
    { sessionId },
  );

  await ctx.db.patch("studySessions", sessionId, { abandonJobId });

  return sessionId;
}
