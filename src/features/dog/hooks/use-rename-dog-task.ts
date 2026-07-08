import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useRenameDogTask() {
  return useConvexMutation(api.mutations.dogTasks.rename.rename);
}
