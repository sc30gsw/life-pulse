import { Field, Form, useForm } from "@formisch/react";
import { Button, Modal, NumberInput, Stack } from "@mantine/core";
import type { UseDisclosureReturnValue } from "@mantine/hooks";
import type { ComponentProps } from "react";

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
  onSuccess?: () => void;
  opened: UseDisclosureReturnValue[0];
};

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
              <NumberInput
                {...field.props}
                description="省略時は16時間(960分)。デモ用に短い分数も指定可能です。"
                error={field.errors?.[0]}
                label="目標時間(分・任意)"
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
                disabled={startFastingForm.isSubmitting}
              />
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
