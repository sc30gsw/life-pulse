import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUpdateDog() {
  return useConvexMutation(api.mutations.dogs.update.update);
}
