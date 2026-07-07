import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConvexError } from "convex/values";
import * as v from "valibot";

import type { Doc } from "~/../convex/_generated/dataModel";
import { hmToMinutes, minutesToHm } from "~/../convex/lib/hm";
import { studyBlocksQuery } from "~/features/study/api/study-blocks-query";
import { useErodeBlock } from "~/features/study/hooks/use-erode-block";
import { useRescheduleBlock } from "~/features/study/hooks/use-reschedule-block";
import { useStartSession } from "~/features/study/hooks/use-start-session";
import { useStudyClock } from "~/features/study/hooks/use-study-clock";
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
  const erodeBlock = useErodeBlock();
  const rescheduleBlock = useRescheduleBlock();
  const startSession = useStartSession();

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
        },
      },
    );
  }

  return {
    blocks: data.blocks,
    onErode,
    onReschedule,
    onStartFromBlock,
    suggestions: data.suggestions,
  } as const;
}
