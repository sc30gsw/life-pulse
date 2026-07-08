export const DOG_PAGE_COPY = {
  sections: {
    image: "犬の写真",
    name: "犬の名前",
    tasks: "お世話タスク管理",
  },
  subtitle: "Dog Profile & Care Tasks",
  title: "犬の管理",
} as const;

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
    emptyDescription: "犬のお世話履歴がありません",
    modalTitle: "犬のお世話履歴",
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
    imageSaveErrorMessage: "犬の写真の保存に失敗しました",
    imageSaveSuccessMessage: "犬の写真を保存しました",
    profileSaveErrorMessage: "犬プロフィールの保存に失敗しました",
    savedTitle: "保存しました",
  },
  todayCare: "今日のケア",
} as const;
