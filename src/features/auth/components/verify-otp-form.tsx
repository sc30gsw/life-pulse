import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, PinInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconMail, IconShieldCheck } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { Result } from "better-result";
import { useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useRef, useState } from "react";
import * as v from "valibot";

import { api } from "~/../convex/_generated/api";
import {
  VerifyOtpSchema,
  type VerifyOtpSchemaType,
} from "~/features/auth/schemas/verify-otp-schema";
import { AuthError } from "~/features/auth/types/auth-error";

const OTP_RESEND_WAIT_MESSAGE = "確認コードはまだ再送できません。少し待ってから再送してください";
const OTP_SEND_MESSAGES = {
  errorMessage: "確認コードの送信に失敗しました",
  errorTitle: "OTP送信エラー",
} as const satisfies Record<string, string>;
const OTP_VERIFY_MESSAGES = {
  errorMessage: "確認コードが正しくありません",
  errorTitle: "OTPエラー",
} as const satisfies Record<string, string>;

type PendingAction = "resend" | "verify" | null;

function isOtpResendWait(cause: unknown) {
  return (
    (cause instanceof ConvexError && cause.data === "OTP_RESEND_WAIT") ||
    (cause instanceof Error && cause.message.includes("OTP_RESEND_WAIT"))
  );
}

function authErrorMessage(cause: unknown, fallback: string) {
  if (isOtpResendWait(cause)) {
    return OTP_RESEND_WAIT_MESSAGE;
  }

  return cause instanceof Error ? cause.message : fallback;
}

async function runOtpAction({
  action,
  messages,
  pending,
  setPendingAction,
}: {
  action: () => Promise<null>;
  messages: typeof OTP_SEND_MESSAGES | typeof OTP_VERIFY_MESSAGES;
  pending: PendingAction;
  setPendingAction?: (pending: PendingAction) => void;
}) {
  if (pending !== null) {
    setPendingAction?.(pending);
  }

  const result = await Result.tryPromise({
    catch: (cause) =>
      new AuthError({
        cause,
        message: authErrorMessage(cause, messages.errorMessage),
      }),
    try: action,
  });

  if (pending !== null) {
    setPendingAction?.(null);
  }

  if (Result.isError(result)) {
    const isResendWait = isOtpResendWait(result.error.cause);

    notifications.show({
      color: isResendWait ? "yellow" : "red",
      message: result.error.message,
      title: isResendWait ? "再送待機中" : messages.errorTitle,
    });

    return false;
  }

  return true;
}

function showOtpSentNotification() {
  notifications.show({
    color: "green",
    message: "確認コードを送信しました",
    title: "OTP送信",
  });
}

export function VerifyOtpForm() {
  const navigate = useNavigate();

  const secondFactorStatus = useQuery(api.queries.auth.secondFactorStatus.secondFactorStatus);
  const verifySecondFactorOtp = useAction(
    api.actions.auth.verifySecondFactorOtp.verifySecondFactorOtp,
  );
  const sendSecondFactorOtp = useAction(api.actions.auth.sendSecondFactorOtp.sendSecondFactorOtp);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isInitialOtpSending, setIsInitialOtpSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const isInitialOtpRequested = useRef(false);

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
  const isPending = isInitialOtpSending || pendingAction !== null || form.isSubmitting;

  async function submitOtp(output: VerifyOtpSchemaType) {
    const result = await runOtpAction({
      action: () => verifySecondFactorOtp(output),
      messages: OTP_VERIFY_MESSAGES,
      pending: "verify",
      setPendingAction,
    });

    if (result) {
      notifications.show({ color: "green", message: "確認が完了しました", title: "OTP確認" });
      void navigate({ to: "/" });
    }
  }

  async function resendCode() {
    await sendOtp("manual");
  }

  async function sendOtp(mode: "initial" | "manual") {
    const result = await runOtpAction({
      action: () => sendSecondFactorOtp({}),
      messages: OTP_SEND_MESSAGES,
      pending: mode === "manual" ? "resend" : null,
      setPendingAction,
    });

    if (result) {
      showOtpSentNotification();
    }
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
      isInitialOtpRequested.current
    ) {
      return;
    }

    isInitialOtpRequested.current = true;
    setIsInitialOtpSending(true);
    void runOtpAction({
      action: () => sendSecondFactorOtp({}),
      messages: OTP_SEND_MESSAGES,
      pending: null,
    }).then((result) => {
      setIsInitialOtpSending(false);

      if (result) {
        showOtpSentNotification();
      }
    });
  }, [secondFactorStatus, sendSecondFactorOtp]);

  function submitCode(code: VerifyOtpSchemaType["code"]) {
    const result = v.safeParse(VerifyOtpSchema, { code });

    if (result.success) {
      submitOtp(result.output);
    }
  }

  const formElement = (
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

  return isInitialOtpSending ? (
    <Shimmer
      loading
      backgroundColor="rgba(255,255,255,0.08)"
      fallbackBorderRadius={6}
      shimmerColor="rgba(255,255,255,0.16)"
    >
      {formElement}
    </Shimmer>
  ) : (
    formElement
  );
}
