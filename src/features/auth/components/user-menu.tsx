import { useAuthActions } from "@convex-dev/auth/react";
import { Avatar, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

import { useViewer } from "~/features/auth/hooks/use-viewer";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const { data: viewer } = useViewer();

  if (viewer === null) {
    return null;
  }

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            <Avatar radius="xl" size="sm">
              {viewer.displayName.slice(0, 1)}
            </Avatar>
            <div>
              <Text fw={600} size="sm">
                {viewer.displayName}
              </Text>
              <Text c="dimmed" size="xs" tt="uppercase">
                {viewer.role}
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            void signOut().then(() => navigate({ to: "/login" }));
          }}
        >
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
