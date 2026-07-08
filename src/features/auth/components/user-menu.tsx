import { Avatar, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Shimmer } from "@shimmer-from-structure/react";
import {
  IconBook2,
  IconChartScatter,
  IconChevronDown,
  IconDog,
  IconHeartbeat,
  IconHourglass,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import cn from "cnfast";

import { LogoutButton } from "~/features/auth/components/logout-button";
import { useViewer } from "~/features/auth/hooks/use-viewer";

export function UserMenu() {
  const [opened, { toggle }] = useDisclosure(false);
  const { data: viewer } = useViewer();

  if (viewer === null) {
    return null;
  }

  const isSelf = viewer.role === "self";

  return (
      <Menu opened={opened} onChange={toggle} position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className="transition hover:brightness-110 active:brightness-95">
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
        <Menu.Item
          className="transition hover:brightness-110 active:brightness-95"
          component={Link}
          leftSection={<IconUser size={14} />}
          to="/profile"
        >
          プロフィール
        </Menu.Item>
        <Menu.Item
          className="transition hover:brightness-110 active:brightness-95"
          component={Link}
          leftSection={<IconDog size={14} />}
          to="/dog"
        >
          犬の管理
        </Menu.Item>
        <Menu.Item
          className="transition hover:brightness-110 active:brightness-95"
          component={Link}
          leftSection={<IconBook2 size={14} />}
          to="/study"
        >
          学習管理
        </Menu.Item>
        <Menu.Item
          className="transition hover:brightness-110 active:brightness-95"
          component={Link}
          leftSection={<IconHourglass size={14} />}
          to="/fasting"
        >
          断食
        </Menu.Item>
        {isSelf && (
          <Menu.Item
            className="transition hover:brightness-110 active:brightness-95"
            component={Link}
            leftSection={<IconHeartbeat size={14} />}
            to="/health"
          >
            健康
          </Menu.Item>
        )}
        {isSelf && (
          <Menu.Item
            className="transition hover:brightness-110 active:brightness-95"
            component={Link}
            leftSection={<IconChartScatter size={14} />}
            to="/insights"
          >
            インサイト
          </Menu.Item>
        )}
        {isSelf && (
          <Menu.Item
            className="transition hover:brightness-110 active:brightness-95"
            component={Link}
            leftSection={<IconSettings size={14} />}
            to="/settings"
          >
            設定
          </Menu.Item>
        )}
        <Menu.Divider />
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
