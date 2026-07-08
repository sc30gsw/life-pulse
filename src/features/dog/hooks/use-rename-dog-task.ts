import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useRenameDogTask() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.dogTasks.rename.rename),
  });
}
