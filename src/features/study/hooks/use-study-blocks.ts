import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ConvexError } from "convex/values";
import * as v from "valibot";

import type { Doc } from "~/../convex/_generated/dataModel";
import { hmToMinutes, minutesToHm } from "~/../convex/lib/hm";
import { studyBlocksQuery } from "~/features/study/api/study-blocks-query";
import { useDeclineBlock } from "~/features/study/hooks/use-decline-block";
import { useErodeBlock } from "~/features/study/hooks/use-erode-block";
import { useRescheduleBlock } from "~/features/study/hooks/use-reschedule-block";
import { useStartSession } from "~/features/study/hooks/use-start-session";
import { useStudyClock } from "~/features/study/hooks/use-study-clock";
import { useUndoDeclineBlock } from "~/features/study/hooks/use-undo-decline-block";
import { CATEGORY_LABELS, type SessionCategory } from "~/types/dashboard";

const CategoryFallbackSchema = v.fallback(
  v.picklist(Object.keys(CATEGORY_LABELS) as SessionCategory[]),
  "other",
);

function showError(message: string) {
  notifications.show({ color: "red", message, title: "エラー" });
}

function showSuccess(title: string, message: string) {
  notifications.show({ color: "green", message, title });
}

export function useStudyBlocks() {
  const { dateJst, nowHm } = useStudyClock();
  const data = useSuspenseQuery(studyBlocksQuery(dateJst, nowHm)).data;
  const declineBlock = useDeclineBlock();
  const erodeBlock = useErodeBlock();
  const rescheduleBlock = useRescheduleBlock();
  const startSession = useStartSession();
  const undoDeclineBlock = useUndoDeclineBlock();
  const navigate = useNavigate();

  function onErode(
    blockId: Doc<"studyBlocks">["_id"],
    reason: NonNullable<Doc<"studyBlocks">["erosionReason"]>,
  ) {
    erodeBlock.mutate(
      { blockId, reason },
      {
        onError: () => {
          showError("侵食の記録に失敗しました");
        },
        onSuccess: () => {
          showSuccess("記録しました", "枠の侵食を記録しました。リスケ候補から選べます");
        },
      },
    );
  }

  function onReschedule(block: Doc<"studyBlocks">, startHm: string) {
    const start = hmToMinutes(startHm);

    if (start === null) {
      return;
    }

    rescheduleBlock.mutate(
      {
        blockId: block._id,
        endHm: minutesToHm(start + block.plannedMinutes),
        startHm,
      },
      {
        onError: () => {
          showError("リスケに失敗しました");
        },
        onSuccess: () => {
          showSuccess("リスケしました", `${startHm} からの枠を作成しました`);
        },
      },
    );
  }

  function onDecline(block: Doc<"studyBlocks">) {
    modals.openConfirmModal({
      cancelProps: { variant: "subtle" },
      centered: true,
      confirmProps: { color: "red" },
      labels: { cancel: "戻る", confirm: "リスケしない" },
      onConfirm: () => {
        declineBlock.mutate(
          { blockId: block._id },
          {
            onError: () => {
              showError("リスケしないの記録に失敗しました");
            },
            onSuccess: () => {
              showSuccess("記録しました", "この枠はリスケせず終了しました");
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
      title: `${block.startHm}〜${block.endHm} の枠をリスケせずに終了しますか？`,
    });
  }

  function onUndoDecline(blockId: Doc<"studyBlocks">["_id"]) {
    undoDeclineBlock.mutate(
      { blockId },
      {
        onError: () => {
          showError("元に戻すのに失敗しました");
        },
        onSuccess: () => {
          showSuccess("元に戻しました", "リスケ候補から選び直せます");
        },
      },
    );
  }

  function onStartFromBlock(block: Doc<"studyBlocks">) {
    startSession.mutate(
      {
        blockId: block._id,
        category: v.parse(CategoryFallbackSchema, block.category),
        dateJst,
        plannedMinutes: block.plannedMinutes,
      },
      {
        onError: (error) => {
          showError(
            error instanceof ConvexError && error.data === "SESSION_EXISTS"
              ? "進行中のセッションがあります"
              : "セッション開始に失敗しました",
          );
        },
        onSuccess: () => {
          showSuccess("開始しました", "この枠でセッションを開始しました");
          navigate({ to: "/" });
        },
      },
    );
  }

  return {
    blocks: data.blocks,
    onDecline,
    onErode,
    onReschedule,
    onStartFromBlock,
    onUndoDecline,
    suggestions: data.suggestions,
  } as const;
}
