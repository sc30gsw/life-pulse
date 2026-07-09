import { Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMailCheck } from "@tabler/icons-react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { useConfirmEmailChange } from "~/features/profile/hooks/use-profile-actions";
import { defaultProfileSearchParams } from "~/features/profile/schemas/profile-search-schema";
import { ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

const routeApi = getRouteApi("/_authenticated/profile");

export function EmailChangeConfirmation() {
  const { emailChangeToken } = routeApi.useSearch();
  const navigate = useNavigate();
  const token = emailChangeToken ?? "";
  const confirmEmailChange = useConfirmEmailChange();

  return (
    <output className="border-bd bg-panel-2 mb-4 block rounded-md border p-4">
      <Stack gap="sm">
        <Text fw={700} size="sm">
          メールアドレス変更の確認
        </Text>
        <Text c={ACCENT_VARS.faint} size="sm">
          新しいメールアドレスへの変更を確定します。ログイン中の同じアカウントでのみ有効です。
        </Text>
        <Group>
          <Button
            leftSection={<IconMailCheck size={18} />}
            loading={confirmEmailChange.isPending}
            disabled={confirmEmailChange.isPending || token.length === 0}
            style={ACCENT_SOLID_STYLE.good}
            onClick={() => {
              confirmEmailChange.mutate(
                { token },
                {
                  onError: () => {
                    notifications.show({
                      color: "red",
                      message: "メールアドレス変更の確認に失敗しました",
                      title: "確認エラー",
                    });
                  },
                  onSuccess: () => {
                    notifications.show({
                      color: "green",
                      message: "メールアドレスを変更しました",
                      title: "変更しました",
                    });
                    void navigate({ to: "/profile", search: defaultProfileSearchParams });
                  },
                },
              );
            }}
          >
            メールアドレス変更を確定
          </Button>
        </Group>
      </Stack>
    </output>
  );
}
