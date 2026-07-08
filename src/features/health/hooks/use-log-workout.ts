import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useLogWorkout() {
  return useConvexMutation(api.mutations.health.logWorkout.logWorkout);
}
