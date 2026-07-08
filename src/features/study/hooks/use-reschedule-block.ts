import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useRescheduleBlock() {
  return useConvexMutation(api.mutations.blocks.reschedule.reschedule);
}
