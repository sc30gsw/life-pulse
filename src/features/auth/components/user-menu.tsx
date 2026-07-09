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
import { useCursorGlow } from "~/hooks/use-cursor-glow";

export function UserMenu() {
  const [opened, { toggle }] = useDisclosure(false);
  const { data: viewer } = useViewer();
  const { glowRef, onPointerEnter, onPointerLeave, onPointerMove } =
    useCursorGlow<HTMLButtonElement>();

  if (viewer === null) {
    return null;
  }

  const isSelf = viewer.role === "self";
  const menuItemClassName = "lp-user-menu-item";
  const iconSize = 15;

  return (
    <Menu
      opened={opened}
      onChange={toggle}
      position="bottom-end"
      shadow="none"
      width={236}
      classNames={{ divider: "lp-user-menu-divider" }}
    >
      <Menu.Target>
        <UnstyledButton
          ref={glowRef}
          className={cn("lp-glow-card lp-user-menu-trigger", opened && "is-open")}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
        >
          <span aria-hidden className="lp-glow-streak" />
          <span aria-hidden className="lp-glow-spot" />
          <span aria-hidden className="lp-glow-border" />
          <Group className="relative z-10" gap="xs" wrap="nowrap">
            <Avatar
              src={viewer.avatarUrl}
              alt={viewer.displayName}
              name={viewer.displayName.slice(0, 1)}
              className="lp-user-menu-avatar"
              radius="xl"
              size="sm"
            />
            <div className="min-w-0">
              <Text className="text-tx truncate" fw={700} size="sm">
                {viewer.displayName}
              </Text>
              <Text className="text-dim tracking-[0.16em]" size="xs" tt="uppercase">
                {viewer.role}
              </Text>
            </div>
            <IconChevronDown
              size={16}
              className={cn(
                "text-dim ml-1 shrink-0 transition-transform duration-200",
                opened && "text-good rotate-180",
              )}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown className="lp-user-menu-dropdown">
        <div className="lp-user-menu-heading">Navigation</div>
        <Menu.Item
          className={menuItemClassName}
          component={Link}
          leftSection={<IconUser size={iconSize} />}
          to="/profile"
        >
          プロフィール
        </Menu.Item>
        <Menu.Item
          className={menuItemClassName}
          component={Link}
          leftSection={<IconDog size={iconSize} />}
          to="/dog"
        >
          愛犬の管理
        </Menu.Item>
        <Menu.Item
          className={menuItemClassName}
          component={Link}
          leftSection={<IconBook2 size={iconSize} />}
          to="/study"
        >
          学習管理
        </Menu.Item>
        <Menu.Item
          className={menuItemClassName}
          component={Link}
          leftSection={<IconHourglass size={iconSize} />}
          to="/fasting"
        >
          断食
        </Menu.Item>
        {isSelf && (
          <Menu.Item
            className={menuItemClassName}
            component={Link}
            leftSection={<IconHeartbeat size={iconSize} />}
            to="/health"
          >
            健康
          </Menu.Item>
        )}
        {isSelf && (
          <Menu.Item
            className={menuItemClassName}
            component={Link}
            leftSection={<IconChartScatter size={iconSize} />}
            to="/insights"
          >
            インサイト
          </Menu.Item>
        )}
        {isSelf && (
          <Menu.Item
            className={menuItemClassName}
            component={Link}
            leftSection={<IconSettings size={iconSize} />}
            to="/settings"
          >
            設定
          </Menu.Item>
        )}
        <Menu.Divider />
        <LogoutButton className="lp-user-menu-item lp-user-menu-logout" />
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
