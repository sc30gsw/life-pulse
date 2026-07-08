import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUpdateWorkout() {
  return useConvexMutation(api.mutations.health.updateWorkout.updateWorkout);
}
