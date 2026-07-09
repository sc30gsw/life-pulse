import { Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { cn } from "cnfast";

import { ACCENT_VARS } from "~/types/dashboard";

export function CategoryRequiredPrompt() {
  return (
    <Stack gap="sm">
      <Text c={ACCENT_VARS.faint} size="sm">
        学習カテゴリが未登録です。カテゴリを追加すると、枠の宣言とセッション開始が使えます。
      </Text>
      <Link
        className={cn(
          "bg-good text-bg inline-flex min-h-9 self-start rounded-md px-4 text-sm font-semibold",
          "items-center justify-center gap-2 no-underline",
          "transition hover:brightness-110 active:brightness-95",
          "focus-visible:outline-good focus-visible:outline-2 focus-visible:outline-offset-2",
        )}
        search={(prev) => ({ ...prev, focus: "categories" })}
        to="/study"
      >
        <IconPlus size={16} />
        カテゴリを追加
      </Link>
    </Stack>
  );
}
