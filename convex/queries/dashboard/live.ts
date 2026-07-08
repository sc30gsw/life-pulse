import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  appSettingsFieldValidators,
  appUserFieldValidators,
  dogEventFieldValidators,
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
      dogName: appSettingsFieldValidators.dogName,
      events: v.array(
        v.object({
          at: dogEventFieldValidators.at,
          byDisplayName: appUserFieldValidators.displayName,
          byRole: appUserFieldValidators.role,
          id: v.id("dogEvents"),
          kind: dogEventFieldValidators.kind,
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
    todayActualMinutes: v.number(),
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
