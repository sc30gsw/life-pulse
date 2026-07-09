import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useRescheduleBlock() {
  return useConvexMutation(api.mutations.blocks.reschedule.reschedule);
}
