import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";

import type { Doc } from "~/../convex/_generated/dataModel";
import { upcomingBlocksQuery } from "~/features/study/api/upcoming-blocks-query";
import { useRemoveBlock } from "~/features/study/hooks/use-remove-block";
import { useStudyClock } from "~/features/study/hooks/use-study-clock";

export function useUpcomingBlocks() {
  const { dateJst } = useStudyClock();
  const blocks = useSuspenseQuery(upcomingBlocksQuery(dateJst)).data;
  const removeBlock = useRemoveBlock();

  function onCancel(block: Doc<"studyBlocks">) {
    modals.openConfirmModal({
      cancelProps: { variant: "subtle" },
      centered: true,
      confirmProps: { color: "red" },
      labels: { cancel: "戻る", confirm: "キャンセルする" },
      onConfirm: () => {
        removeBlock.mutate(
          { blockId: block._id },
          {
            onError: () => {
              notifications.show({
                color: "red",
                message: "予定枠のキャンセルに失敗しました",
                title: "エラー",
              });
            },
            onSuccess: () => {
              notifications.show({
                color: "green",
                message: "予定枠をキャンセルしました",
                title: "キャンセルしました",
              });
            },
          },
        );
      },
      title: `${block.dateJst} ${block.startHm}〜${block.endHm} の予定枠をキャンセルしますか？`,
    });
  }

  return { blocks, onCancel } as const;
}
