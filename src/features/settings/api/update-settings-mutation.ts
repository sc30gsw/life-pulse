import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUpdateSettings() {
  return useConvexMutation(api.mutations.settings.update.update);
}
