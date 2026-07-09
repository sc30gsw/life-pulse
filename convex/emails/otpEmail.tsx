import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

type OtpEmailProps = {
  code: string;
  expiresInMinutes: number;
};

export function OtpEmail({ code, expiresInMinutes }: OtpEmailProps) {
  return (
    <Html dir="ltr" lang="ja">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-[#0b0f14] font-sans" dir="ltr" lang="ja">
          <Preview>Life Pulse の確認コード: {code}</Preview>
          <Container
            className="mx-auto my-8 w-[560px] rounded-lg border border-solid border-[#2a3340] bg-[#111820] p-7"
            dir="ltr"
            lang="ja"
          >
            <Heading className="m-0 mb-4 text-[22px] text-[#e8edf2]">Life Pulse 確認コード</Heading>
            <Text className="text-[15px] leading-6 text-[#e8edf2]">
              サインインを完了するには、以下の6桁コードを入力してください。
            </Text>
            <Section className="my-6 rounded-lg border border-solid border-[#5dd6b1] bg-[#07110f] py-[18px] text-center">
              <Text className="m-0 font-mono text-[32px] font-bold tracking-[6px] text-[#5dd6b1]">
                {code}
              </Text>
            </Section>
            <Text className="text-[13px] leading-5 text-[#9aa7b4]">
              このコードは{expiresInMinutes}
              分で期限切れになります。心当たりがない場合は、このメールを破棄してください。
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
