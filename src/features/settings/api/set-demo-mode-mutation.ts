import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useSetDemoMode() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.demo.setDemoMode.setDemoMode),
  });
}
