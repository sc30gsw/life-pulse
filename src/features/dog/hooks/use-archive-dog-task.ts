import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useArchiveDogTask() {
  return useConvexMutation(api.mutations.dogTasks.archive.archive);
}
