import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useUpdateWorkout() {
  return useConvexMutation(api.mutations.health.updateWorkout.updateWorkout);
}
