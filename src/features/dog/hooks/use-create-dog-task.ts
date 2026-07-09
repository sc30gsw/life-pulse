import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useCreateDogTask() {
  return useConvexMutation(api.mutations.dogTasks.create.create);
}
