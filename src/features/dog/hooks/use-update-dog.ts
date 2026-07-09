import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUpdateDog() {
  return useConvexMutation(api.mutations.dogs.update.update);
}

export function useGenerateDogImageUploadUrl() {
  return useConvexMutation(api.mutations.dogs.generateImageUploadUrl.generateImageUploadUrl);
}

export function useSetDogImage() {
  return useConvexMutation(api.mutations.dogs.setImage.setImage);
}

export function useRemoveDogImage() {
  return useConvexMutation(api.mutations.dogs.removeImage.removeImage);
}
