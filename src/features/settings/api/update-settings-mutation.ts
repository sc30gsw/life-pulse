import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useUpdateSettings() {
  return useConvexMutation(api.mutations.settings.update.update);
}
