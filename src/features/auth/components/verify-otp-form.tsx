import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, PinInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMail, IconShieldCheck } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { Result } from "better-result";
import { useAction } from "convex/react";
import { useTransition } from "react";
import * as v from "valibot";

import { api } from "~/../convex/_generated/api";
import {
  VerifyOtpSchema,
  type VerifyOtpSchemaType,
} from "~/features/auth/schemas/verify-otp-schema";
import { AuthError } from "~/features/auth/types/auth-error";

export function VerifyOtpForm() {
  const navigate = useNavigate();

  const verifySecondFactorOtp = useAction(
    api.actions.auth.verifySecondFactorOtp.verifySecondFactorOtp,
  );
  const sendSecondFactorOtp = useAction(api.actions.auth.sendSecondFactorOtp.sendSecondFactorOtp);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    initialInput: { code: "" },
    revalidate: "input",
    schema: VerifyOtpSchema,
    validate: "submit",
  });

  function submitOtp(output: VerifyOtpSchemaType) {
    startTransition(async () => {
      const result = await Result.tryPromise({
        catch: (cause) =>
          new AuthError({
            cause,
            message: cause instanceof Error ? cause.message : "確認コードが正しくありません",
          }),
        try: () => verifySecondFactorOtp(output),
      });

      if (Result.isError(result)) {
        notifications.show({
          color: "red",
          message: result.error.message,
          title: "OTPエラー",
        });
        return;
      }

      notifications.show({ color: "green", message: "確認が完了しました", title: "OTP確認" });
      void navigate({ to: "/" });
    });
  }

  function resendCode() {
    startTransition(async () => {
      const result = await Result.tryPromise({
        catch: (cause) =>
          new AuthError({
            cause,
            message: cause instanceof Error ? cause.message : "確認コードの送信に失敗しました",
          }),
        try: () => sendSecondFactorOtp({}),
      });

      if (Result.isError(result)) {
        notifications.show({
          color: "red",
          message: result.error.message,
          title: "OTP送信エラー",
        });
        return;
      }

      notifications.show({ color: "green", message: "確認コードを送信しました", title: "OTP送信" });
    });
  }

  function submitCode(code: string) {
    const result = v.safeParse(VerifyOtpSchema, { code });

    if (result.success) {
      submitOtp(result.output);
    }
  }

  return (
    <Form of={form} onSubmit={(output) => void submitOtp(output)}>
      <Field of={form} path={["code"]}>
        {(field) => (
          <>
            <PinInput
              aria-label="One time code"
              disabled={isPending || form.isSubmitting}
              inputMode="numeric"
              length={6}
              oneTimeCode
              placeholder="○"
              type="number"
              value={field.input ?? ""}
              onChange={field.onChange}
              onComplete={submitCode}
            />
            <Group grow w="100%">
              <Button
                leftSection={<IconShieldCheck size={18} />}
                loading={isPending || form.isSubmitting}
                disabled={(field.input ?? "").length !== 6 || isPending || form.isSubmitting}
                type="submit"
              >
                確認
              </Button>
              <Button
                variant="light"
                leftSection={<IconMail size={18} />}
                loading={isPending || form.isSubmitting}
                disabled={isPending || form.isSubmitting}
                type="button"
                onClick={() => void resendCode()}
              >
                再送
              </Button>
            </Group>
          </>
        )}
      </Field>
    </Form>
  );
}
