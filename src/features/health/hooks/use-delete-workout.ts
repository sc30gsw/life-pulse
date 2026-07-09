import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useDeleteWorkout() {
  return useConvexMutation(api.mutations.health.deleteWorkout.deleteWorkout);
}
