import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useArchiveDogTask() {
  return useConvexMutation(api.mutations.dogTasks.archive.archive);
}
