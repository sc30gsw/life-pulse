import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useRenameDogTask() {
  return useConvexMutation(api.mutations.dogTasks.rename.rename);
}
