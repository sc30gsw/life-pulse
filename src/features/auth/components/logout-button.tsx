import { useAuthActions } from "@convex-dev/auth/react";
import { Menu } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";

export function LogoutButton() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  return (
    <Menu.Item
      className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
      color="red"
      disabled={isPending}
      leftSection={<IconLogout size={16} />}
      onClick={() => {
        startTransition(async () => {
          await signOut();
          navigate({ to: "/login" });
        });
      }}
    >
      ログアウト
    </Menu.Item>
  );
}
