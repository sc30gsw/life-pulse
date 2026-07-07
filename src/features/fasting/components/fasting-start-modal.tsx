import { Field, Form, useForm } from "@formisch/react";
import { Button, Modal, Slider, Stack, Text } from "@mantine/core";
import type { UseDisclosureReturnValue } from "@mantine/hooks";
import type { ComponentProps } from "react";

import { useStartFasting } from "~/features/fasting/hooks/use-start-fasting";
import { StartFastingSchema } from "~/features/fasting/schemas/start-fasting-schema";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

const DEFAULT_TARGET_MINUTES = 960;
const MAX_TARGET_MINUTES = 960;
const MIN_TARGET_MINUTES = 1;

const MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

const SLIDER_MARKS = [
  { value: MIN_TARGET_MINUTES, label: "1m" },
  { value: 240, label: "4h" },
  { value: 480, label: "8h" },
  { value: 720, label: "12h" },
  { value: MAX_TARGET_MINUTES, label: "16h" },
] as const satisfies ComponentProps<typeof Slider>["marks"];

const SLIDER_STYLES = {
  bar: {
    background: "linear-gradient(90deg, var(--blue), var(--tx))",
    boxShadow: "0 0 16px var(--glow)",
  },
  mark: {
    backgroundColor: "var(--blue)",
    borderColor: "var(--bd2)",
  },
  markLabel: {
    color: "var(--dim)",
    fontSize: 11,
  },
  thumb: {
    backgroundColor: "var(--tx)",
    borderColor: "color-mix(in srgb, var(--blue) 60%, var(--bd2))",
    boxShadow: "0 0 18px var(--glow)",
  },
  track: {
    background:
      "linear-gradient(165deg, var(--blue), color-mix(in srgb, var(--blue) 60%, var(--tx)))",
    border: "1px solid var(--bd)",
    boxShadow: "var(--cardsh)",
  },
} as const satisfies ComponentProps<typeof Slider>["styles"];

type FastingStartModalProps = {
  onClose: UseDisclosureReturnValue[1]["close"];
  onSuccess?: () => void;
  opened: UseDisclosureReturnValue[0];
};

function formatTargetMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}分`;
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  return remainderMinutes === 0 ? `${hours}時間` : `${hours}時間${remainderMinutes}分`;
}

export function FastingStartModal({ opened, onClose, onSuccess }: FastingStartModalProps) {
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
          startFasting.mutate(
            { targetMinutes: output.targetMinutes },
            {
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
                  label={formatTargetMinutes}
                  marks={SLIDER_MARKS}
                  max={MAX_TARGET_MINUTES}
                  min={MIN_TARGET_MINUTES}
                  onChange={field.onChange}
                  step={1}
                  styles={SLIDER_STYLES}
                  thumbLabel="目標時間"
                  thumbValueText={formatTargetMinutes}
                  value={field.input ?? DEFAULT_TARGET_MINUTES}
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
