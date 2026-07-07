import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useCompleteSession() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.sessions.complete.complete),
  });
}
