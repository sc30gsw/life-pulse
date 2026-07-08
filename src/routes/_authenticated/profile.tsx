import { Button, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { GlowCard } from "~/components/glow-card";
import { AvatarUploader } from "~/features/profile/components/avatar-uploader";
import { DisplayNameForm } from "~/features/profile/components/display-name-form";
import { EmailChangeForm } from "~/features/profile/components/email-change-form";
import { PasswordChangeForm } from "~/features/profile/components/password-change-form";
import { ACCENT_VARS } from "~/types/dashboard";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function SectionLabel({ label }: Record<"label", string>) {
  return (
    <Text
      component="h2"
      size="11px"
      fw={600}
      tt="uppercase"
      c={ACCENT_VARS.faint}
      style={{ letterSpacing: "0.14em" }}
      m={0}
      mb="md"
    >
      {label}
    </Text>
  );
}

function ProfilePage() {
  return (
    <>
      <Group component="header" wrap="wrap" gap="md" align="center" mb="lg">
        <Stack gap={0} mr="auto">
          <Text className="lp-brandtext" component="h1" fw={700} size="lg" m={0}>
            プロフィール
          </Text>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            Account Profile
          </Text>
        </Stack>
      </Group>

      <main className="grid gap-4 lg:grid-cols-2">
        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="表示名" />
          <Suspense fallback={<ProfileFormFallback />}>
            <DisplayNameForm />
          </Suspense>
        </GlowCard>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="アバター" />
          <Suspense fallback={<ProfileFormFallback />}>
            <AvatarUploader />
          </Suspense>
        </GlowCard>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="メールアドレス" />
          <EmailChangeForm />
        </GlowCard>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="パスワード" />
          <PasswordChangeForm />
        </GlowCard>
      </main>
    </>
  );
}

function ProfileFormFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <Text size="sm">プロフィールを読み込み中</Text>
        <Button className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100">
          保存する
        </Button>
      </Stack>
    </Shimmer>
  );
}
