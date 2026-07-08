import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useSetDemoMode() {
  return useConvexMutation(api.mutations.demo.setDemoMode.setDemoMode);
}
