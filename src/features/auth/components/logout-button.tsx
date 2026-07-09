import { useAuthActions } from "@convex-dev/auth/react";
import { Menu } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import cn from "cnfast";
import { useTransition } from "react";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  return (
    <Menu.Item
      className={cn(
        "transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
        className,
      )}
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
