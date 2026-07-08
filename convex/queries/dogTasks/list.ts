import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogTaskDocumentValidator } from "../../lib/validators";
import { listActiveDogTasks } from "../../services/dogTasks/list";

export const list = query({
  args: {},
  returns: v.array(dogTaskDocumentValidator),
  handler: async (ctx) => {
    await requireUser(ctx);

    return await listActiveDogTasks(ctx);
  },
});
