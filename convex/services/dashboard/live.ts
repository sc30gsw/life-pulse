import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

type LiveArgs = Record<"dateJst", string>;

export async function live(ctx: QueryCtx, viewer: Doc<"appUsers">, args: LiveArgs) {
  const selfUser = await ctx.db
    .query("appUsers")
    .withIndex("by_role", (q) => q.eq("role", "self"))
    .first();

  const [session, fasting, health, blocks, todayActualMinutes, dog, partnerPresence] =
    await Promise.all([
      resolveSession(ctx, selfUser),
      resolveFasting(ctx, selfUser),
      resolveHealth(ctx, args.dateJst),
      resolveBlocks(ctx, selfUser, args.dateJst),
      resolveTodayActualMinutes(ctx, selfUser, args.dateJst),
      resolveDog(ctx, args.dateJst),
      resolvePartnerPresence(ctx),
    ]);

  return {
    blocks,
    dog,
    fasting,
    health,
    partnerPresence,
    session,
    todayActualMinutes,
    viewer: { displayName: viewer.displayName, role: viewer.role },
  };
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

async function resolveFasting(ctx: QueryCtx, selfUser: Doc<"appUsers"> | null) {
  if (selfUser === null) {
    return null;
  }

  return await ctx.db
    .query("fastingWindows")
    .withIndex("by_user_status", (q) => q.eq("userId", selfUser._id).eq("status", "fasting"))
    .first();
}

async function resolveHealth(ctx: QueryCtx, dateJst: string) {
  const rows = await ctx.db
    .query("healthMetrics")
    .withIndex("by_date", (q) => q.eq("dateJst", dateJst))
    .collect();

  return rows.find((row) => row.source !== "demo") ?? null;
}

async function resolveBlocks(ctx: QueryCtx, selfUser: Doc<"appUsers"> | null, dateJst: string) {
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
  dateJst: string,
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

async function resolveDog(ctx: QueryCtx, dateJst: string) {
  const settings = await ctx.db.query("appSettings").first();
  const dogName = settings?.dogName ?? "ハマロ";

  const rawEvents = await ctx.db
    .query("dogEvents")
    .withIndex("by_date", (q) => q.eq("dateJst", dateJst))
    .collect();

  const eventsWithActor = await Promise.all(
    rawEvents.map(async (event) => {
      const byUser = await ctx.db.get("appUsers", event.byUserId);

      // A missing appUsers row means the actor was deleted after logging the
      // event; drop it rather than surfacing a broken reference on the board.
      if (byUser === null) {
        return null;
      }

      return {
        at: event.at,
        byDisplayName: byUser.displayName,
        byRole: byUser.role,
        id: event._id,
        kind: event.kind,
      };
    }),
  );

  const events = eventsWithActor.filter((event) => event !== null);

  return { dogName, events };
}

async function resolvePartnerPresence(ctx: QueryCtx) {
  const partner = await ctx.db
    .query("appUsers")
    .withIndex("by_role", (q) => q.eq("role", "partner"))
    .first();

  if (partner === null) {
    return null;
  }

  const presence = await ctx.db
    .query("presence")
    .withIndex("by_user", (q) => q.eq("userId", partner._id))
    .first();

  if (presence === null) {
    return null;
  }

  return {
    etaHm: presence.etaHm,
    state: presence.state,
    updatedAt: presence.updatedAt,
  };
}
