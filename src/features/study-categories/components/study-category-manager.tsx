import { Field, Form, reset, useForm } from "@formisch/react";
import { ActionIcon, Badge, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconArchive,
  IconArrowBackUp,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { cn } from "cnfast";
import { useState } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useArchiveStudyCategory } from "~/features/study-categories/hooks/use-archive-study-category";
import { useCreateStudyCategory } from "~/features/study-categories/hooks/use-create-study-category";
import { useMoveStudyCategory } from "~/features/study-categories/hooks/use-move-study-category";
import { useRemoveStudyCategory } from "~/features/study-categories/hooks/use-remove-study-category";
import { useRenameStudyCategory } from "~/features/study-categories/hooks/use-rename-study-category";
import { useRestoreStudyCategory } from "~/features/study-categories/hooks/use-restore-study-category";
import { useStudyCategoriesQuery } from "~/features/study-categories/hooks/use-study-categories-query";
import { StudyCategoryNameSchema } from "~/features/study-categories/schemas/study-category-name-schema";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE } from "~/types/dashboard";

function showError(message: string) {
  notifications.show({ color: "red", message, title: "エラー" });
}

function showSuccess(title: string, message: string) {
  notifications.show({ color: "green", message, title });
}

export function StudyCategoryManager() {
  const { activeCategories, categories } = useStudyCategoriesQuery();
  const createCategory = useCreateStudyCategory();
  const moveCategory = useMoveStudyCategory();
  const createForm = useForm({ initialInput: { name: "" }, schema: StudyCategoryNameSchema });

  function onMove(categoryId: Doc<"studyCategories">["_id"], direction: "down" | "up") {
    moveCategory.mutate(
      { categoryId, direction },
      { onError: () => showError("並び替えに失敗しました") },
    );
  }

  return (
    <Stack gap="md">
      <Form
        of={createForm}
        onSubmit={(output) => {
          createCategory.mutate(output, {
            onError: () => showError("カテゴリの追加に失敗しました"),
            onSuccess: () => {
              showSuccess("追加しました", `「${output.name}」を追加しました`);
              reset(createForm);
            },
          });
        }}
      >
        <Group align="flex-start" gap="sm" wrap="nowrap">
          <Field of={createForm} path={["name"]}>
            {(field) => (
              <TextInput
                {...field.props}
                aria-label="新しいカテゴリ名"
                className="flex-1"
                disabled={createForm.isSubmitting}
                error={field.errors?.[0]}
                placeholder="新しいカテゴリ名"
                value={field.input}
              />
            )}
          </Field>
          <Button
            className="shrink-0 transition hover:brightness-110 active:brightness-95"
            disabled={createForm.isSubmitting}
            leftSection={<IconPlus size={16} />}
            loading={createForm.isSubmitting}
            style={ACCENT_SOLID_STYLE.good}
            type="submit"
          >
            追加
          </Button>
        </Group>
      </Form>

      {categories.length === 0 ? (
        <Text c="dimmed" size="sm">
          カテゴリがありません。上のフォームから追加してください。
        </Text>
      ) : (
        <Stack gap={8}>
          {categories.map((category) => (
            <StudyCategoryRow
              activeIndex={activeCategories.findIndex((active) => active._id === category._id)}
              activeLength={activeCategories.length}
              category={category}
              key={category._id}
              onMove={onMove}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

type StudyCategoryRowProps = {
  activeIndex: number;
  activeLength: number;
  category: Doc<"studyCategories">;
  onMove: (categoryId: Doc<"studyCategories">["_id"], direction: "down" | "up") => void;
};

function StudyCategoryRow({ activeIndex, activeLength, category, onMove }: StudyCategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const archiveCategory = useArchiveStudyCategory();
  const removeCategory = useRemoveStudyCategory();
  const renameCategory = useRenameStudyCategory();
  const restoreCategory = useRestoreStudyCategory();
  const renameForm = useForm({
    initialInput: { name: category.name },
    schema: StudyCategoryNameSchema,
  });
  const isArchived = category.archivedAt !== undefined;

  function onArchive() {
    archiveCategory.mutate(
      { categoryId: category._id },
      {
        onError: () => showError("カテゴリの非表示に失敗しました"),
        onSuccess: () => showSuccess("非表示にしました", `「${category.name}」を非表示にしました`),
      },
    );
  }

  function onRestore() {
    restoreCategory.mutate(
      { categoryId: category._id },
      {
        onError: () => showError("カテゴリの復元に失敗しました"),
        onSuccess: () => showSuccess("復元しました", `「${category.name}」を復元しました`),
      },
    );
  }

  function onRemove() {
    modals.openConfirmModal({
      cancelProps: { variant: "subtle" },
      centered: true,
      confirmProps: { color: "red" },
      labels: { cancel: "戻る", confirm: "削除する" },
      onConfirm: () => {
        removeCategory.mutate(
          { categoryId: category._id },
          {
            onError: () => showError("カテゴリの削除に失敗しました"),
            onSuccess: (result) => {
              if (result === "deleted") {
                showSuccess("削除しました", `「${category.name}」を削除しました`);
              } else {
                showSuccess("非表示にしました", `使用済みのため「${category.name}」を非表示にしました`);
              }
            },
          },
        );
      },
      styles: {
        body: { color: "var(--tx)" },
        content: {
          backgroundColor: "var(--panel)",
          border: "1px solid var(--bd2)",
          color: "var(--tx)",
        },
        header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
        title: { color: "var(--tx)", fontWeight: 700 },
      },
      title: `「${category.name}」を削除しますか？`,
    });
  }

  if (isEditing) {
    return (
      <Form
        of={renameForm}
        onSubmit={(output) => {
          renameCategory.mutate(
            { categoryId: category._id, name: output.name },
            {
              onError: () => showError("カテゴリ名の更新に失敗しました"),
              onSuccess: () => showSuccess("更新しました", "カテゴリ名を更新しました"),
            },
          );
          setIsEditing(false);
        }}
      >
        <Group className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5" gap={8}>
          <Field of={renameForm} path={["name"]}>
            {(field) => (
              <TextInput
                {...field.props}
                aria-label="カテゴリ名"
                className="flex-1"
                error={field.errors?.[0]}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsEditing(false);
                  }
                }}
                size="sm"
                value={field.input}
              />
            )}
          </Field>
          <ActionIcon aria-label="保存" className="border-bd bg-inset" type="submit" variant="default">
            <IconCheck size={16} />
          </ActionIcon>
          <ActionIcon
            aria-label="キャンセル"
            className="border-bd bg-inset"
            onClick={() => setIsEditing(false)}
            type="button"
            variant="default"
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Form>
    );
  }

  return (
    <Group className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5" gap={12} wrap="nowrap">
      <Text className="text-tx flex-1" fw={500} size="sm">
        {category.name}
      </Text>
      {isArchived ? (
        <Badge
          className={cn(ACCENT_CLASSES.faint.border, ACCENT_CLASSES.faint.text, "border")}
          variant="outline"
        >
          非表示
        </Badge>
      ) : null}
      <Group gap={4} wrap="nowrap">
        <ActionIcon
          aria-label="上へ移動"
          className="border-bd bg-inset"
          disabled={isArchived || activeIndex <= 0}
          onClick={() => onMove(category._id, "up")}
          variant="default"
        >
          <IconChevronUp size={16} />
        </ActionIcon>
        <ActionIcon
          aria-label="下へ移動"
          className="border-bd bg-inset"
          disabled={isArchived || activeIndex === -1 || activeIndex >= activeLength - 1}
          onClick={() => onMove(category._id, "down")}
          variant="default"
        >
          <IconChevronDown size={16} />
        </ActionIcon>
        <ActionIcon
          aria-label="名前を変更"
          className="border-bd bg-inset"
          onClick={() => setIsEditing(true)}
          variant="default"
        >
          <IconPencil size={16} />
        </ActionIcon>
        {isArchived ? (
          <ActionIcon
            aria-label="復元"
            className="border-bd bg-inset"
            onClick={onRestore}
            variant="default"
          >
            <IconArrowBackUp size={16} />
          </ActionIcon>
        ) : (
          <ActionIcon
            aria-label="非表示"
            className="border-bd bg-inset"
            onClick={onArchive}
            variant="default"
          >
            <IconArchive size={16} />
          </ActionIcon>
        )}
        <ActionIcon
          aria-label="削除"
          className={cn(ACCENT_CLASSES.coral.border, ACCENT_CLASSES.coral.bg, ACCENT_CLASSES.coral.text)}
          onClick={onRemove}
          variant="default"
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );
}
