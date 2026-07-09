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

export function useRemoveAvatar() {
  return useConvexMutation(api.mutations.users.removeAvatar.removeAvatar);
}

export function useRequestEmailChange() {
  const requestEmailChange = useAction(api.actions.users.requestEmailChange.requestEmailChange);
  return useMutation({ mutationFn: requestEmailChange });
}

export function useConfirmEmailChange() {
  const confirmEmailChange = useAction(api.actions.users.confirmEmailChange.confirmEmailChange);
  return useMutation({ mutationFn: confirmEmailChange });
}

export function useUpdatePassword() {
  const updatePassword = useAction(api.actions.users.updatePassword.updatePassword);
  return useMutation({ mutationFn: updatePassword });
}
