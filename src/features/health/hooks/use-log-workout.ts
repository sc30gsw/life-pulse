import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useLogWorkout() {
  return useConvexMutation(api.mutations.health.logWorkout.logWorkout);
}
