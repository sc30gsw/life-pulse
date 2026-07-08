import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { fastingWindowDocumentValidator } from "../../lib/validators";
import { history as historyService } from "../../services/fasting/history";

export const history = query({
  args: {},
  returns: v.array(fastingWindowDocumentValidator),
  handler: async (ctx) => {
    await requireUser(ctx);

    return await historyService(ctx);
  },
});
