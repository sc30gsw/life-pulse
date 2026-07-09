import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, PinInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMail, IconShieldCheck } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { Result } from "better-result";
import { useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useRef, useState, useTransition } from "react";
import * as v from "valibot";

import { api } from "~/../convex/_generated/api";
import {
  VerifyOtpSchema,
  type VerifyOtpSchemaType,
} from "~/features/auth/schemas/verify-otp-schema";
import { AuthError } from "~/features/auth/types/auth-error";

const OTP_RESEND_WAIT_MESSAGE = "確認コードはまだ再送できません。少し待ってから再送してください";
const INITIAL_OTP_AUTH_RETRY_DELAY_MS = 1_000;
const INITIAL_OTP_AUTH_RETRY_LIMIT = 3;

function isOtpResendWait(cause: unknown) {
  return (
    (cause instanceof ConvexError && cause.data === "OTP_RESEND_WAIT") ||
    (cause instanceof Error && cause.message.includes("OTP_RESEND_WAIT"))
  );
}

function isUnauthenticated(cause: unknown) {
  return (
    (cause instanceof ConvexError && cause.data === "UNAUTHENTICATED") ||
    (cause instanceof Error && cause.message.includes("UNAUTHENTICATED"))
  );
}

function authErrorMessage(cause: unknown, fallback: string) {
  if (isOtpResendWait(cause)) {
    return OTP_RESEND_WAIT_MESSAGE;
  }

  return cause instanceof Error ? cause.message : fallback;
}

export function VerifyOtpForm() {
  const navigate = useNavigate();

  const secondFactorStatus = useQuery(api.queries.auth.secondFactorStatus.secondFactorStatus);
  const verifySecondFactorOtp = useAction(
    api.actions.auth.verifySecondFactorOtp.verifySecondFactorOtp,
  );
  const sendSecondFactorOtp = useAction(api.actions.auth.sendSecondFactorOtp.sendSecondFactorOtp);
  const [pendingAction, setPendingAction] = useState<"resend" | "verify" | null>(null);
  const [isTransitionPending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  const hasRequestedInitialOtp = useRef(false);

  const form = useForm({
    initialInput: { code: "" },
    revalidate: "input",
    schema: VerifyOtpSchema,
    validate: "submit",
  });

  const resendAvailableAt = secondFactorStatus?.resendAvailableAt ?? null;
  const resendWaitSeconds =
    resendAvailableAt === null ? 0 : Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  const isResendCoolingDown = resendWaitSeconds > 0;
  const isPending = isTransitionPending || pendingAction !== null || form.isSubmitting;

  function submitOtp(output: VerifyOtpSchemaType) {
    setPendingAction("verify");

    startTransition(async () => {
      const result = await Result.tryPromise({
        catch: (cause) =>
          new AuthError({
            cause,
            message: authErrorMessage(cause, "確認コードが正しくありません"),
          }),
        try: () => verifySecondFactorOtp(output),
      });

      if (Result.isError(result)) {
        notifications.show({
          color: "red",
          message: result.error.message,
          title: "OTPエラー",
        });

        setPendingAction(null);

        return;
      }

      notifications.show({ color: "green", message: "確認が完了しました", title: "OTP確認" });
      void navigate({ to: "/" });
      setPendingAction(null);
    });
  }

  function resendCode() {
    setPendingAction("resend");

    startTransition(async () => {
      const result = await Result.tryPromise({
        catch: (cause) =>
          new AuthError({
            cause,
            message: authErrorMessage(cause, "確認コードの送信に失敗しました"),
          }),
        try: () => sendSecondFactorOtp({}),
      });

      if (Result.isError(result)) {
        const isResendWait = isOtpResendWait(result.error.cause);

        notifications.show({
          color: isResendWait ? "yellow" : "red",
          message: result.error.message,
          title: isResendWait ? "再送待機中" : "OTP送信エラー",
        });

        setPendingAction(null);
        return;
      }

      notifications.show({ color: "green", message: "確認コードを送信しました", title: "OTP送信" });
      setPendingAction(null);
    });
  }

  useEffect(() => {
    if (resendAvailableAt === null || resendAvailableAt <= now) {
      return;
    }

    const timerId = window.setInterval(() => setNow(Date.now()), 1_000);

    return () => window.clearInterval(timerId);
  }, [now, resendAvailableAt]);

  useEffect(() => {
    if (
      secondFactorStatus === undefined ||
      !secondFactorStatus.required ||
      secondFactorStatus.verified ||
      secondFactorStatus.resendAvailableAt !== null ||
      hasRequestedInitialOtp.current
    ) {
      return;
    }

    hasRequestedInitialOtp.current = true;
    setPendingAction("resend");
    let cancelled = false;
    let retryTimerId: number | null = null;

    startTransition(async () => {
      async function sendInitialOtp(attempt: number): Promise<void> {
        const result = await Result.tryPromise({
          catch: (cause) =>
            new AuthError({
              cause,
              message: authErrorMessage(cause, "確認コードの送信に失敗しました"),
            }),
          try: () => sendSecondFactorOtp({}),
        });

        if (cancelled) {
          return;
        }

        if (!Result.isError(result)) {
          notifications.show({
            color: "green",
            message: "確認コードを送信しました",
            title: "OTP送信",
          });
          setPendingAction(null);
          return;
        }

        const isResendWait = isOtpResendWait(result.error.cause);

        if (isUnauthenticated(result.error.cause) && attempt < INITIAL_OTP_AUTH_RETRY_LIMIT) {
          await new Promise<void>((resolve) => {
            retryTimerId = window.setTimeout(resolve, INITIAL_OTP_AUTH_RETRY_DELAY_MS);
          });

          if (cancelled) {
            return;
          }

          return await sendInitialOtp(attempt + 1);
        }

        notifications.show({
          color: isResendWait ? "yellow" : "red",
          message: result.error.message,
          title: isResendWait ? "再送待機中" : "OTP送信エラー",
        });
        setPendingAction(null);
        return;
      }

      await sendInitialOtp(0);
    });

    return () => {
      cancelled = true;

      if (retryTimerId !== null) {
        window.clearTimeout(retryTimerId);
      }
    };
  }, [secondFactorStatus, sendSecondFactorOtp, startTransition]);

  function submitCode(code: VerifyOtpSchemaType["code"]) {
    const result = v.safeParse(VerifyOtpSchema, { code });

    if (result.success) {
      submitOtp(result.output);
    }
  }

  return (
    <Form of={form} onSubmit={submitOtp}>
      <Field of={form} path={["code"]}>
        {(field) => (
          <>
            <PinInput
              aria-label="One time code"
              disabled={isPending}
              inputMode="numeric"
              length={6}
              oneTimeCode
              placeholder="○"
              type="number"
              value={field.input ?? ""}
              onChange={field.onChange}
              onComplete={submitCode}
              mask
            />
            <Group grow w="100%" mt="md">
              <Button
                leftSection={<IconShieldCheck size={18} />}
                loading={pendingAction === "verify" || form.isSubmitting}
                disabled={(field.input ?? "").length !== 6 || isPending}
                type="submit"
              >
                確認
              </Button>
              <Button
                variant="light"
                leftSection={<IconMail size={18} />}
                loading={pendingAction === "resend"}
                disabled={isPending || isResendCoolingDown}
                type="button"
                onClick={resendCode}
              >
                {isResendCoolingDown ? `再送 (${resendWaitSeconds}s)` : "再送"}
              </Button>
            </Group>
          </>
        )}
      </Field>
    </Form>
  );
}
