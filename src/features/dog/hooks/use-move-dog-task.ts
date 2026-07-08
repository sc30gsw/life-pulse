import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useMoveDogTask() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.dogTasks.move.move),
  });
}
