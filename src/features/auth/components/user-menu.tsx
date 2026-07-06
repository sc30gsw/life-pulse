import { Avatar, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChevronDown } from "@tabler/icons-react";
import cn from "cnfast";

import { LogoutButton } from "~/features/auth/components/logout-button";
import { useViewer } from "~/features/auth/hooks/use-viewer";

export function UserMenu() {
  const [opened, { toggle }] = useDisclosure(false);
  const { data: viewer } = useViewer();

  if (viewer === null) {
    return null;
  }

  return (
    <Menu opened={opened} onChange={toggle} position="bottom-end" shadow="md" width={200}>
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
            <IconChevronDown
              size={16}
              className={cn("transition-transform duration-200", opened && "rotate-180")}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <LogoutButton />
      </Menu.Dropdown>
    </Menu>
  );
}

export function UserMenuFallback() {
  return (
    <Shimmer loading>
      <Group gap="xs">
        <Avatar radius="xl" size="sm" />
        <div>
          <Text fw={600} size="sm">
            ユーザー名
          </Text>
          <Text c="dimmed" size="xs" tt="uppercase">
            role
          </Text>
        </div>
        <IconChevronDown size={16} />
      </Group>
    </Shimmer>
  );
}
