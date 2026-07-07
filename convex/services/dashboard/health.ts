import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { mergeByDate } from "../health/mergeByDate";

type HealthArgs = Pick<Doc<"healthMetrics">, "dateJst">;

export async function health(ctx: QueryCtx, args: HealthArgs) {
  const [rows, settings] = await Promise.all([
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) => q.eq("dateJst", args.dateJst))
      .collect(),
    ctx.db.query("appSettings").first(),
  ]);

  return mergeByDate(rows, settings?.demoMode ?? false)[0] ?? null;
}
