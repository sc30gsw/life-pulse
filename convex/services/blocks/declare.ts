import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertDateJst, todayJst } from "../../lib/dateRange";
import { hmToMinutes } from "../../lib/hm";
import { assertCategoryIsActive } from "../studyCategories/validate";

type DeclareArgs = Pick<Doc<"studyBlocks">, "dateJst" | "endHm" | "startHm"> &
  Record<"categoryId", Id<"studyCategories">>;

export async function declare(ctx: MutationCtx, user: Doc<"appUsers">, args: DeclareArgs) {
  // A malformed dateJst would create an orphan block that no dateJst-keyed
  // query can ever see — reject it at the boundary.
  assertDateJst(args.dateJst);
  if (args.dateJst < todayJst()) {
    throw new ConvexError("PAST_DATE");
  }

  const start = hmToMinutes(args.startHm);
  const end = hmToMinutes(args.endHm);

  if (start === null || end === null || start >= end) {
    throw new ConvexError("INVALID_RANGE");
  }

  await assertCategoryIsActive(ctx, user, args.categoryId);

  // plannedMinutes is derived server-side from the time range so the two can
  // never drift (decided in the W2 planning interview: the form only inputs
  // startHm / endHm / categoryId).
  return await ctx.db.insert("studyBlocks", {
    categoryId: args.categoryId,
    dateJst: args.dateJst,
    endHm: args.endHm,
    plannedMinutes: end - start,
    source: "manual",
    startHm: args.startHm,
    status: "planned",
    userId: user._id,
  });
}
