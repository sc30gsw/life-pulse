import { Result, type Result as ResultType } from "better-result";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertDateJst, todayJst } from "../../lib/dateRange";
import { hmToMinutes } from "../../lib/hm";
import type { StudyCategoryError } from "../studyCategories/errors";
import { assertCategoryIsActive } from "../studyCategories/validate";
import { BlockError } from "./errors";

type DeclareArgs = Pick<Doc<"studyBlocks">, "dateJst" | "endHm" | "startHm"> &
  Record<"categoryId", Id<"studyCategories">>;

export async function declare(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: DeclareArgs,
): Promise<ResultType<Doc<"studyBlocks">["_id"], BlockError | StudyCategoryError>> {
  // A malformed dateJst would create an orphan block that no dateJst-keyed
  // query can ever see — reject it at the boundary.
  assertDateJst(args.dateJst);
  if (args.dateJst < todayJst()) {
    return Result.err(new BlockError({ code: "PAST_DATE" }));
  }

  const start = hmToMinutes(args.startHm);
  const end = hmToMinutes(args.endHm);

  if (start === null || end === null || start >= end) {
    return Result.err(new BlockError({ code: "INVALID_RANGE" }));
  }

  const categoryResult = await assertCategoryIsActive(ctx, user, args.categoryId);
  if (Result.isError(categoryResult)) {
    return Result.err(categoryResult.error);
  }

  // plannedMinutes is derived server-side from the time range so the two can
  // never drift (decided in the W2 planning interview: the form only inputs
  // startHm / endHm / categoryId).
  return Result.ok(
    await ctx.db.insert("studyBlocks", {
      categoryId: args.categoryId,
      dateJst: args.dateJst,
      endHm: args.endHm,
      plannedMinutes: end - start,
      source: "manual",
      startHm: args.startHm,
      status: "planned",
      userId: user._id,
    }),
  );
}
