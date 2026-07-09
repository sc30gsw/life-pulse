import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

import { Doc } from "../_generated/dataModel";

type EmailChangeConfirmationEmailProps = {
  confirmationUrl: string;
  expiresInMinutes: number;
  newEmail: Doc<"emailChangeTokens">["newEmail"];
};

export function EmailChangeConfirmationEmail({
  confirmationUrl,
  expiresInMinutes,
  newEmail,
}: EmailChangeConfirmationEmailProps) {
  return (
    <Html dir="ltr" lang="ja">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="m-0 bg-[#0b0f14] px-4 py-6 font-sans" dir="ltr" lang="ja">
          <Preview>Life Pulse のメールアドレス変更確認</Preview>
          <Container
            className="mx-auto box-border w-full max-w-[520px] rounded-lg border border-solid border-[#2a3340] bg-[#111820] p-6"
            dir="ltr"
            lang="ja"
          >
            <Heading className="m-0 mb-4 text-[22px] text-[#e8edf2]">
              メールアドレス変更を確認
            </Heading>
            <Text className="text-[15px] leading-6 text-[#e8edf2]">
              Life Pulse のログインメールアドレスを {newEmail}{" "}
              に変更するリクエストを受け付けました。
            </Text>
            <Button
              className="box-border rounded-md bg-[#5dd6b1] px-5 py-3 text-center text-[15px] font-bold text-[#07110f] no-underline"
              href={confirmationUrl}
            >
              メールアドレス変更を確認
            </Button>
            <Text className="text-sm leading-[22px] break-all text-[#5dd6b1]">
              {confirmationUrl}
            </Text>
            <Text className="text-[13px] leading-5 text-[#9aa7b4]">
              このリンクは{expiresInMinutes}
              分で期限切れになり、ログイン中の同じアカウントで1回だけ使用できます。心当たりがない場合は、このメールを破棄してください。
            </Text>
            <Hr className="my-6 border border-solid border-[#2a3340]" />
            <Text className="text-xs leading-[18px] text-[#9aa7b4]">
              Life Pulse からの自動送信メールです。
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
