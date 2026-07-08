import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useMoveDogTask() {
  return useConvexMutation(api.mutations.dogTasks.move.move);
}
