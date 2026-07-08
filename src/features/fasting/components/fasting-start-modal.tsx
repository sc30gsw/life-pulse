import { Field, Form, useForm } from "@formisch/react";
import { Button, Modal, Slider, Stack, Text } from "@mantine/core";
import type { UseDisclosureReturnValue } from "@mantine/hooks";
import type { ComponentProps } from "react";

import {
  DEFAULT_FASTING_TARGET_MINUTES,
  formatFastingTargetMinutes,
  MAX_FASTING_TARGET_MINUTES,
  MIN_FASTING_TARGET_MINUTES,
} from "~/features/fasting/constants/fasting-target";
import {
  FASTING_TARGET_SLIDER_MARKS,
  FASTING_TARGET_SLIDER_STYLES,
} from "~/features/fasting/constants/fasting-target-slider";
import { useStartFasting } from "~/features/fasting/hooks/use-start-fasting";
import { StartFastingSchema } from "~/features/fasting/schemas/start-fasting-schema";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

const MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

type FastingStartModalProps = {
  onClose: UseDisclosureReturnValue[1]["close"];
  onStartAttempt?: () => (() => void) | void;
  onSuccess?: () => void;
  opened: UseDisclosureReturnValue[0];
};

export function FastingStartModal({
  opened,
  onClose,
  onStartAttempt,
  onSuccess,
}: FastingStartModalProps) {
  const startFastingForm = useForm({
    revalidate: "input",
    schema: StartFastingSchema,
    validate: "blur",
  });
  const startFasting = useStartFasting();

  return (
    <Modal centered onClose={onClose} opened={opened} styles={MODAL_STYLES} title="断食開始">
      <Form
        of={startFastingForm}
        onSubmit={(output) => {
          const releaseFlashSuppression = onStartAttempt?.();

          startFasting.mutate(
            { targetMinutes: output.targetMinutes },
            {
              onError: () => {
                releaseFlashSuppression?.();
              },
              onSuccess: () => {
                onClose();
                onSuccess?.();
              },
            },
          );
        }}
      >
        <Stack gap="md">
          <Field of={startFastingForm} path={["targetMinutes"]}>
            {(field) => (
              <Stack gap="xs">
                <div>
                  <Text c="var(--tx)" fw={700} size="sm">
                    目標時間
                  </Text>
                  <Text c="var(--dim)" size="xs">
                    省略時は16時間。デモ用に短い時間も指定可能です。
                  </Text>
                </div>
                <Slider
                  disabled={startFastingForm.isSubmitting}
                  label={formatFastingTargetMinutes}
                  marks={FASTING_TARGET_SLIDER_MARKS}
                  max={MAX_FASTING_TARGET_MINUTES}
                  min={MIN_FASTING_TARGET_MINUTES}
                  onChange={field.onChange}
                  step={1}
                  styles={FASTING_TARGET_SLIDER_STYLES}
                  thumbLabel="目標時間"
                  thumbValueText={formatFastingTargetMinutes}
                  value={field.input ?? DEFAULT_FASTING_TARGET_MINUTES}
                  className="mt-2 mb-4"
                />
                {field.errors?.[0] ? (
                  <Text c="var(--coral)" size="xs">
                    {field.errors[0]}
                  </Text>
                ) : null}
              </Stack>
            )}
          </Field>
          <Button
            disabled={startFastingForm.isSubmitting}
            loading={startFastingForm.isSubmitting}
            style={ACCENT_SOLID_STYLE.good}
            type="submit"
            className="hover:brightness-120"
          >
            開始する
          </Button>
        </Stack>
      </Form>
    </Modal>
  );
}
