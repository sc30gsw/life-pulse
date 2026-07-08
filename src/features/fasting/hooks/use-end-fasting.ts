import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useEndFasting() {
  return useConvexMutation(api.mutations.fasting.end.end);
}
