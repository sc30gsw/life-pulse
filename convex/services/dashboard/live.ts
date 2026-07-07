import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { dog } from "./dog";
import { fasting } from "./fasting";
import { health } from "./health";
import { presence } from "./presence";
import { selfPresence as resolveSelfPresence } from "./selfPresence";
import { study } from "./study";
import { viewer as resolveViewer } from "./viewer";

type LiveArgs = Pick<Doc<"studyBlocks">, "dateJst">;

export async function live(ctx: QueryCtx, viewer: Doc<"appUsers">, args: LiveArgs) {
  const [studyData, fastingData, healthData, dogData, partnerPresence, selfPresence] =
    await Promise.all([
      study(ctx, args),
      fasting(ctx),
      health(ctx, args),
      dog(ctx, args),
      presence(ctx),
      resolveSelfPresence(ctx),
    ]);

  return {
    blocks: studyData.blocks,
    dog: dogData,
    fasting: fastingData,
    health: healthData,
    partnerPresence,
    selfPresence,
    session: studyData.session,
    todayActualMinutes: studyData.todayActualMinutes,
    viewer: resolveViewer(viewer),
  };
}
