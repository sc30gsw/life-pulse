import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { appSettingsFieldValidators } from "../../lib/validators";
import { get as getSettings } from "../../services/settings/get";

export const get = query({
  args: {},
  returns: v.object({
    demoMode: appSettingsFieldValidators.demoMode,
    dogName: appSettingsFieldValidators.dogName,
    fastingDefaultMinutes: appSettingsFieldValidators.fastingDefaultMinutes,
  }),
  handler: async (ctx) => {
    await requireSelf(ctx);

    return await getSettings(ctx);
  },
});
