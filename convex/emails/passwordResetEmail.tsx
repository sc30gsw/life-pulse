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

type PasswordResetEmailProps = {
  resetUrl: string;
  expiresInMinutes: number;
};

export function PasswordResetEmail({ expiresInMinutes, resetUrl }: PasswordResetEmailProps) {
  return (
    <Html dir="ltr" lang="ja">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-[#0b0f14] font-sans" dir="ltr" lang="ja">
          <Preview>Life Pulse のパスワード再設定リンク</Preview>
          <Container
            className="mx-auto my-8 w-[560px] rounded-lg border border-solid border-[#2a3340] bg-[#111820] p-7"
            dir="ltr"
            lang="ja"
          >
            <Heading className="m-0 mb-4 text-[22px] text-[#e8edf2]">パスワードを再設定</Heading>
            <Text className="text-[15px] leading-6 text-[#e8edf2]">
              Life Pulse
              のパスワード再設定がリクエストされました。以下のURLを開き、新しいパスワードを設定してください。
            </Text>
            <Button
              className="box-border rounded-md bg-[#5dd6b1] px-5 py-3 text-center text-[15px] font-bold text-[#07110f] no-underline"
              href={resetUrl}
            >
              パスワード再設定を開く
            </Button>
            <Text className="text-sm leading-[22px] break-all text-[#5dd6b1]">{resetUrl}</Text>
            <Text className="text-[13px] leading-5 text-[#9aa7b4]">
              このリンクは{expiresInMinutes}
              分で期限切れになり、1回だけ使用できます。心当たりがない場合は、このメールを破棄してください。
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
