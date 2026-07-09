import { Group, Stack, Text } from "@mantine/core";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";
import { Suspense } from "react";

import { GlowCard } from "~/components/glow-card";
import { AvatarUploader } from "~/features/profile/components/avatar-uploader";
import { DisplayNameForm } from "~/features/profile/components/display-name-form";
import { EmailChangeConfirmation } from "~/features/profile/components/email-change-confirmation";
import { EmailChangeForm } from "~/features/profile/components/email-change-form";
import { PasswordChangeForm } from "~/features/profile/components/password-change-form";
import { ProfileFormFallback } from "~/features/profile/components/profile-form-fallback";
import { SectionLabel } from "~/features/profile/components/section-label";
import {
  ProfileSearchSchema,
  defaultProfileSearchParams,
} from "~/features/profile/schemas/profile-search-schema";
import { ACCENT_VARS } from "~/types/dashboard";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  validateSearch: valibotValidator(ProfileSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultProfileSearchParams)],
  },
});

function ProfilePage() {
  const { emailChangeToken } = Route.useSearch();

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

      {emailChangeToken !== undefined && <EmailChangeConfirmation />}

      <main className="grid gap-4 lg:grid-cols-2">
        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border lg:col-span-2"
          p="lg"
          radius={18}
        >
          <SectionLabel label="プロフィール" />
          <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
            <Suspense fallback={<ProfileFormFallback />}>
              <AvatarUploader />
            </Suspense>
            <Suspense fallback={<ProfileFormFallback />}>
              <DisplayNameForm />
            </Suspense>
          </div>
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
