import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useAction } from "convex/react";

import { api } from "~/../convex/_generated/api";

export function useUpdateDisplayName() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.users.updateDisplayName.updateDisplayName),
  });
}

export function useGenerateAvatarUploadUrl() {
  return useMutation({
    mutationFn: useConvexMutation(
      api.mutations.users.generateAvatarUploadUrl.generateAvatarUploadUrl,
    ),
  });
}

export function useSetAvatar() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.users.setAvatar.setAvatar),
  });
}

export function useUpdateEmail() {
  const updateEmail = useAction(api.actions.users.updateEmail.updateEmail);
  return useMutation({ mutationFn: updateEmail });
}

export function useUpdatePassword() {
  const updatePassword = useAction(api.actions.users.updatePassword.updatePassword);
  return useMutation({ mutationFn: updatePassword });
}
