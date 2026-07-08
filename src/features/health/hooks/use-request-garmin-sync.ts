import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useRequestGarminSync() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.health.requestGarminSync.requestGarminSync),
  });
}
