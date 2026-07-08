import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useMoveDogTask() {
  return useConvexMutation(api.mutations.dogTasks.move.move);
}
