import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useSetDemoMode() {
  return useConvexMutation(api.mutations.demo.setDemoMode.setDemoMode);
}
