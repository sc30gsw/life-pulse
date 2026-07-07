import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useUpdateSettings() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.settings.update.update),
  });
}
