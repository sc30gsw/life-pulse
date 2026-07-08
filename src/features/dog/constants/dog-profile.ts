export const DOG_PAGE_COPY = {
  sections: {
    image: "犬の写真",
    name: "犬の名前",
    tasks: "お世話タスク管理",
  },
  subtitle: "Dog Profile & Care Tasks",
  title: "犬の管理",
} as const satisfies DogPageCopy;

export const DOG_PROFILE_COPY = {
  actions: {
    cancel: "キャンセル",
    choosePhoto: "写真を選ぶ",
    create: "作成する",
    save: "保存する",
    savePhoto: "写真を保存",
  },
  fallbackName: "犬",
  history: {
    close: "閉じる",
    emptyTitle: "履歴なし",
    emptyDescription: "犬のお世話履歴がありません",
    latestOnly: "直近だけ表示",
    latestRangeLabel: "直近7日",
    modalTitle: "犬のお世話履歴",
    open: "履歴",
    rangeSummary: (dayCount: number, eventCount: number) => `${dayCount} 日分 · ${eventCount} 件`,
    showOlderDays: (dayCount: number) => `過去 ${dayCount} 日を表示`,
  },
  missing: {
    dashboardDescription: "犬の管理画面でプロフィールを作成してください。",
    imageDescription: "先に犬の名前を登録すると、写真をアップロードできます。",
    title: "犬プロフィール未作成",
  },
  navigation: {
    manage: "犬の管理へ",
  },
  notification: {
    errorTitle: "エラー",
    imageSaveErrorMessage: "犬の写真の保存に失敗しました",
    imageSaveSuccessMessage: "犬の写真を保存しました",
    profileCreatedMessage: (name: string) => `犬プロフィールを「${name}」で作成しました`,
    profileCreatedTitle: "作成しました",
    profileSaveErrorMessage: "犬プロフィールの保存に失敗しました",
    profileUpdatedMessage: (name: string) => `名前を「${name}」に変更しました`,
    profileUpdatedTitle: "変更しました",
    savedTitle: "保存しました",
  },
  validation: {
    nameRequired: "名前を入力してください",
  },
  todayCare: "今日のケア",
} as const satisfies DogProfileCopy;

export const DOG_TASK_COPY = {
  actions: {
    add: "追加",
    cancel: "キャンセル",
    confirmDelete: "削除する",
    moveDown: "下へ移動",
    moveUp: "上へ移動",
    rename: "名前を変更",
    save: "保存する",
    undoRecord: "取り消す",
    undoDelete: "戻る",
  },
  aria: {
    nameInput: "タスク名",
    newNameInput: "新しいタスク名",
  },
  dashboard: {
    allDoneLabel: "すべて完了",
    doneByPartner: "パートナー",
    doneBySelf: "本人",
    fallbackPendingLabel: "未実施 3 件",
    fallbackTaskNames: ["朝散歩", "朝ごはん", "薬", "トイレ"],
    incompleteLabel: "未",
    manageAriaLabel: "犬の管理",
    manageLabel: "管理",
    pendingCountLabel: (count: number) => `未実施 ${count} 件`,
  },
  history: {
    eventCount: (count: number) => `${count} 件`,
    fallbackByline: "本人 · 06:30:00",
    fallbackTaskName: "朝散歩",
  },
  notification: {
    addErrorMessage: "タスクの追加に失敗しました",
    addedMessage: (name: string) => `「${name}」を追加しました`,
    addedTitle: "追加しました",
    archiveConfirmTitle: (name: string) => `「${name}」を削除しますか？`,
    archiveErrorMessage: "タスクの削除に失敗しました",
    archivedMessage: (name: string) => `「${name}」を削除しました`,
    archivedTitle: "削除しました",
    errorTitle: "エラー",
    moveErrorMessage: "並び替えに失敗しました",
    recordErrorMessage: "記録に失敗しました",
    recordedMessage: (dogName: string, taskName: string) => `${dogName}の${taskName}を記録しました`,
    recordedTitle: "記録しました",
    renameErrorMessage: "タスク名の変更に失敗しました",
    renamedMessage: "タスク名を変更しました",
    renamedTitle: "変更しました",
    undoConfirmTitle: "記録を取り消しますか?",
    undoErrorMessage: "取消に失敗しました",
    undoneMessage: (dogName: string, taskName: string) => `${dogName}の${taskName}を取り消しました`,
    undoneTitle: "取り消しました",
  },
  states: {
    empty: "お世話タスクがありません。上のフォームから追加してください。",
  },
  validation: {
    nameRequired: "タスク名を入力してください",
  },
} as const satisfies DogTaskCopy;

type DogPageCopy = {
  sections: Record<"image" | "name" | "tasks", string>;
  subtitle: string;
  title: string;
};

type DogProfileCopy = {
  actions: Record<"cancel" | "choosePhoto" | "create" | "save" | "savePhoto", string>;
  fallbackName: string;
  history: {
    close: string;
    emptyDescription: string;
    emptyTitle: string;
    latestOnly: string;
    latestRangeLabel: string;
    modalTitle: string;
    open: string;
    rangeSummary: (dayCount: number, eventCount: number) => string;
    showOlderDays: (dayCount: number) => string;
  };
  missing: Record<"dashboardDescription" | "imageDescription" | "title", string>;
  navigation: Record<"manage", string>;
  notification: {
    errorTitle: string;
    imageSaveErrorMessage: string;
    imageSaveSuccessMessage: string;
    profileCreatedMessage: (name: string) => string;
    profileCreatedTitle: string;
    profileSaveErrorMessage: string;
    profileUpdatedMessage: (name: string) => string;
    profileUpdatedTitle: string;
    savedTitle: string;
  };
  todayCare: string;
  validation: Record<"nameRequired", string>;
};

type DogTaskCopy = {
  actions: Record<
    | "add"
    | "cancel"
    | "confirmDelete"
    | "moveDown"
    | "moveUp"
    | "rename"
    | "save"
    | "undoDelete"
    | "undoRecord",
    string
  >;
  aria: Record<"nameInput" | "newNameInput", string>;
  dashboard: {
    allDoneLabel: string;
    doneByPartner: string;
    doneBySelf: string;
    fallbackPendingLabel: string;
    fallbackTaskNames: readonly string[];
    incompleteLabel: string;
    manageAriaLabel: string;
    manageLabel: string;
    pendingCountLabel: (count: number) => string;
  };
  history: {
    eventCount: (count: number) => string;
    fallbackByline: string;
    fallbackTaskName: string;
  };
  notification: {
    addErrorMessage: string;
    addedMessage: (name: string) => string;
    addedTitle: string;
    archiveConfirmTitle: (name: string) => string;
    archiveErrorMessage: string;
    archivedMessage: (name: string) => string;
    archivedTitle: string;
    errorTitle: string;
    moveErrorMessage: string;
    recordErrorMessage: string;
    recordedMessage: (dogName: string, taskName: string) => string;
    recordedTitle: string;
    renameErrorMessage: string;
    renamedMessage: string;
    renamedTitle: string;
    undoConfirmTitle: string;
    undoErrorMessage: string;
    undoneMessage: (dogName: string, taskName: string) => string;
    undoneTitle: string;
  };
  states: Record<"empty", string>;
  validation: Record<"nameRequired", string>;
};
