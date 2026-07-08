import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useStartFasting() {
  return useConvexMutation(api.mutations.fasting.start.start);
}
