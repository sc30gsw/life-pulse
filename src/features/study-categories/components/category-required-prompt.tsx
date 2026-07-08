import { Button, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { IconPlus } from "@tabler/icons-react";

import { ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

export function CategoryRequiredPrompt() {
  return (
    <Stack gap="sm">
      <Text c={ACCENT_VARS.faint} size="sm">
        学習カテゴリが未登録です。カテゴリを追加すると、枠の宣言とセッション開始が使えます。
      </Text>
      <Button
        className="self-start transition hover:brightness-110 active:brightness-95"
        component={Link}
        leftSection={<IconPlus size={16} />}
        search={{ focus: "categories" }}
        style={ACCENT_SOLID_STYLE.good}
        to="/study"
      >
        カテゴリを追加
      </Button>
    </Stack>
  );
}
