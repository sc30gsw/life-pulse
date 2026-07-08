import { useMutation } from "@tanstack/react-query";
import { useAction } from "convex/react";

import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUpdateDisplayName() {
  return useConvexMutation(api.mutations.users.updateDisplayName.updateDisplayName);
}

export function useGenerateAvatarUploadUrl() {
  return useConvexMutation(api.mutations.users.generateAvatarUploadUrl.generateAvatarUploadUrl);
}

export function useSetAvatar() {
  return useConvexMutation(api.mutations.users.setAvatar.setAvatar);
}

export function useUpdateEmail() {
  const updateEmail = useAction(api.actions.users.updateEmail.updateEmail);
  return useMutation({ mutationFn: updateEmail });
}

export function useUpdatePassword() {
  const updatePassword = useAction(api.actions.users.updatePassword.updatePassword);
  return useMutation({ mutationFn: updatePassword });
}
