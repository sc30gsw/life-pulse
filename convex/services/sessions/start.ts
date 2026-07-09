import { Result, type Result as ResultType } from "better-result";

import { internal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertDateJst } from "../../lib/dateRange";
import type { StudyCategoryError } from "../studyCategories/errors";
import { assertCategoryBelongsToUser, assertCategoryIsActive } from "../studyCategories/validate";
import { SessionError } from "./errors";
import { resolveCurrentSession } from "./resolveCurrentSession";

const ABANDON_AFTER_MS = 6 * 60 * 60 * 1000;

type StartArgs = Pick<Doc<"studySessions">, "blockId" | "dateJst" | "plannedMinutes"> &
  Record<"categoryId", Id<"studyCategories">>;

export async function start(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: StartArgs,
): Promise<ResultType<Doc<"studySessions">["_id"], SessionError | StudyCategoryError>> {
  const existing = await resolveCurrentSession(ctx, user._id);

  if (existing !== null) {
    return Result.err(new SessionError({ code: "SESSION_EXISTS", sessionId: existing._id }));
  }

  assertDateJst(args.dateJst);

  if (args.blockId !== undefined) {
    const block = await ctx.db.get(args.blockId);

    if (block === null || block.userId !== user._id || block.categoryId !== args.categoryId) {
      return Result.err(new SessionError({ blockId: args.blockId, code: "BLOCK_NOT_FOUND" }));
    }

    const categoryResult = await assertCategoryBelongsToUser(ctx, user, args.categoryId);
    if (Result.isError(categoryResult)) {
      return Result.err(categoryResult.error);
    }
  } else {
    const categoryResult = await assertCategoryIsActive(ctx, user, args.categoryId);
    if (Result.isError(categoryResult)) {
      return Result.err(categoryResult.error);
    }
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

  return Result.ok(sessionId);
}
