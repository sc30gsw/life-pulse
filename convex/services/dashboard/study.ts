import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

type StudyArgs = Pick<Doc<"studyBlocks">, "dateJst">;

export async function study(ctx: QueryCtx, args: StudyArgs) {
  const selfUser = await ctx.db
    .query("appUsers")
    .withIndex("by_role", (q) => q.eq("role", "self"))
    .first();

  const [session, blocks, todayActualMinutes] = await Promise.all([
    resolveSession(ctx, selfUser),
    resolveBlocks(ctx, selfUser, args.dateJst),
    resolveTodayActualMinutes(ctx, selfUser, args.dateJst),
  ]);

  return { blocks, session, todayActualMinutes };
}

async function resolveSession(ctx: QueryCtx, selfUser: Doc<"appUsers"> | null) {
  if (selfUser === null) {
    return null;
  }

  const active = await ctx.db
    .query("studySessions")
    .withIndex("by_user_status", (q) => q.eq("userId", selfUser._id).eq("status", "active"))
    .first();

  if (active !== null) {
    return active;
  }

  return await ctx.db
    .query("studySessions")
    .withIndex("by_user_status", (q) => q.eq("userId", selfUser._id).eq("status", "paused"))
    .first();
}

async function resolveBlocks(
  ctx: QueryCtx,
  selfUser: Doc<"appUsers"> | null,
  dateJst: Doc<"studyBlocks">["dateJst"],
) {
  if (selfUser === null) {
    return [];
  }

  return await ctx.db
    .query("studyBlocks")
    .withIndex("by_user_date", (q) => q.eq("userId", selfUser._id).eq("dateJst", dateJst))
    .collect();
}

async function resolveTodayActualMinutes(
  ctx: QueryCtx,
  selfUser: Doc<"appUsers"> | null,
  dateJst: Doc<"studySessions">["dateJst"],
) {
  if (selfUser === null) {
    return 0;
  }

  const sessions = await ctx.db
    .query("studySessions")
    .withIndex("by_user_date", (q) => q.eq("userId", selfUser._id).eq("dateJst", dateJst))
    .collect();

  const completedMs = sessions
    .filter((session) => session.status === "completed")
    .reduce((sum, session) => sum + session.accumulatedMs, 0);

  return Math.round(completedMs / 60_000);
}
