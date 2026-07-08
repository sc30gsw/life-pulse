import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUpsertManual() {
  return useConvexMutation(api.mutations.health.upsertManual.upsertManual);
}
