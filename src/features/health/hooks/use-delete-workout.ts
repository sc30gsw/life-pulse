import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useDeleteWorkout() {
  return useConvexMutation(api.mutations.health.deleteWorkout.deleteWorkout);
}
