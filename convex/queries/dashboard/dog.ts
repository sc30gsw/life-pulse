import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  appSettingsFieldValidators,
  appUserFieldValidators,
  dogEventFieldValidators,
} from "../../lib/validators";
import { dog as dogService } from "../../services/dashboard/dog";

export const dog = query({
  args: { dateJst: dogEventFieldValidators.dateJst },
  returns: v.object({
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
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await dogService(ctx, args);
  },
});
