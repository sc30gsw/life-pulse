import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  appUserFieldValidators,
  dogEventFieldValidators,
  dogFieldValidators,
  dogTaskFieldValidators,
  fastingWindowDocumentValidator,
  healthMetricDocumentValidator,
  presenceFieldValidators,
  studyBlockDocumentValidator,
  studyBlockFieldValidators,
  studySessionDocumentValidator,
} from "../../lib/validators";
import { live as liveService } from "../../services/dashboard/live";

export const live = query({
  args: { dateJst: studyBlockFieldValidators.dateJst },
  returns: v.object({
    blocks: v.array(studyBlockDocumentValidator),
    dog: v.object({
      dogName: dogFieldValidators.name,
      tasks: v.array(
        v.object({
          at: v.optional(dogEventFieldValidators.at),
          byRole: v.optional(appUserFieldValidators.role),
          done: v.boolean(),
          name: dogTaskFieldValidators.name,
          taskId: v.id("dogTasks"),
        }),
      ),
    }),
    fasting: v.union(v.null(), fastingWindowDocumentValidator),
    health: v.union(v.null(), healthMetricDocumentValidator),
    partnerPresence: v.union(
      v.null(),
      v.object({
        etaHm: presenceFieldValidators.etaHm,
        state: presenceFieldValidators.state,
        updatedAt: presenceFieldValidators.updatedAt,
      }),
    ),
    selfPresence: v.union(
      v.null(),
      v.object({
        etaHm: presenceFieldValidators.etaHm,
        state: presenceFieldValidators.state,
        updatedAt: presenceFieldValidators.updatedAt,
      }),
    ),
    session: v.union(v.null(), studySessionDocumentValidator),
    todayActualMinutes: studyBlockFieldValidators.plannedMinutes,
    viewer: v.object({
      displayName: appUserFieldValidators.displayName,
      role: appUserFieldValidators.role,
    }),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await liveService(ctx, user, args);
  },
});
