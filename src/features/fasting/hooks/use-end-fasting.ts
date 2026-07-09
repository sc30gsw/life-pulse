import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useEndFasting() {
  return useConvexMutation(api.mutations.fasting.end.end);
}
