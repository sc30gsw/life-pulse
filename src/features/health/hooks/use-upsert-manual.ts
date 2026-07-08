import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useUpsertManual() {
  return useConvexMutation(api.mutations.health.upsertManual.upsertManual);
}
