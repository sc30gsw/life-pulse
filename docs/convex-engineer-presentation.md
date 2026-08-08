# Convex — Databaseから始まるリアクティブ・バックエンド

OpenDesign用プレゼンテーション設計。調査基準日は2026-08-08（JST）。

## 生成ブリーフ

- **形式**: 16:9、日本語、35枚、90分
- **対象**: Convex未経験だがTypeScript/React、REST API、SQLの基礎経験があるソフトウェアエンジニア
- **中心命題**: Convexは、Databaseを中心にTypeScript functions、transactions、reactive sync、clients、scheduler、storage、search、operationsを一つのモデルへ統合したbackend platformである
- **物語**: 最小tasksアプリ → Databaseの保証 → Functions/Realtime → Life Pulse実演 → 本番対応 → Components/AI → 採用判断
- **語調**: 技術的、率直、誇張しない。利点と非保証を同じ場所に置く
- **用語**: 公式識別子は英語のまま使う。`query subscription` と `mutation後のreactive update`、authenticationとauthorization、AI codingとAI app runtimeを混同しない
- **分類badge**: `CORE`、`OFFICIAL OPTIONAL`、`THIRD-PARTY / INTEGRATION`
- **出典**: 各スライド下部に短い一次資料名、speaker notesに完全URL

## ビジュアルディレクション

- Life Pulseのデザイン言語を継承する: 暗色背景、JetBrains Mono、カード/inset panel、細いborder、status chip、progress bar
- 色は既存のsemantic tokensに対応させる: `good`=保証、`coral`=注意、`amber`=境界、`violet`=optional、`blue`=integration。新しいhex値は発明しない
- Databaseを常に中央または最下層へ置き、query/mutation/action/clientを周囲へ接続する
- 図は装飾より関係を優先する。矢印には動詞を書く。1枚1主張
- コードは12〜16行以内。行を光らせる場合は一度に3行以内
- 写真素材は使わない。architecture diagram、code、comparison card、timelineを主体にする
- モーションはdependencyの伝播、transaction commit、retry/rollbackだけに限定する

## 時間配分

| セクション                             | スライド |     時間 |
| -------------------------------------- | -------: | -------: |
| 導入                                   |      1–2 |      4分 |
| Database                               |     3–10 |     20分 |
| 理解チェック                           |       11 |      1分 |
| Functions / Realtime                   |    12–17 |     15分 |
| Life Pulse統合デモ                     |       18 |      8分 |
| 本番機能                               |    19–23 |     11分 |
| 理解チェック                           |       24 |      1分 |
| Components / AI / Testing / Operations |    25–30 |     12分 |
| 採用判断・まとめ                       |    31–34 |     10分 |
| Q&A                                    |       35 |      8分 |
| **合計**                               | **35枚** | **90分** |

---

## 1. 導入 — 4分

### Slide 01 — ConvexはDatabaseから理解する

**投影**

> Databaseから始まり、画面がリアルタイムに動き、本番運用まで一つの型でつながる。

`Convex — Databaseから始まるリアクティブ・バックエンド`

**図解**: 中央のDatabaseからFunctions、Realtime clients、Scheduler、Storage/Search、Operationsへ線が伸びるタイトル図。

**Speaker notes**

- 今日の主役はAIでもComponentsでもなくDatabase。
- ただしDatabase単体製品として説明すると、Convexのプログラミングモデルを取りこぼす。
- 90分後の到達点は「作れる」「保証を説明できる」「採用を判断できる」。

**Evidence**: [Convex Overview](https://docs.convex.dev/understanding/overview)

### Slide 02 — 小さなtasksアプリを本番へ育てる

**投影**

1. Store — document-relational data
2. Protect — validation and transactions
3. Sync — reactive queries
4. Extend — actions and platform capabilities
5. Operate — tests, deployments, limits
6. Decide — fit / non-fit

**図解**: 6段階の横向きprogress bar。Database区間を最大幅にする。

**Speaker notes**

- `CORE` / `OFFICIAL OPTIONAL` / `THIRD-PARTY` のbadgeをここで導入。
- 「機能一覧」ではなく、一つのアプリが成長する順序で進む。

**Evidence**: [Functions](https://docs.convex.dev/functions/overview), [Components](https://docs.convex.dev/components/overview)

---

## 2. Database — 20分

### Slide 03 — Documentの柔軟性とrelationを同時に持つ

**投影**

- JSON-like document
- `Id<"table">` で別tableを参照
- `_id` / `_creationTime` は自動
- 公式の呼称は **document-relational**

```ts
export default defineSchema({
  tasks: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    status: v.union(v.literal("todo"), v.literal("done")),
  }).index("by_owner_status", ["ownerId", "status"]),
});
```

**図解**: tasks documentカードとusers documentカードをtyped IDで接続する。

**Speaker notes**

- 「NoSQLだからrelationがない」ではない。
- SQL join構文ではなく、IDとTypeScript query logicでread modelを構成する。
- 1 document < 1 MiB、深さや配列にも上限がある。

**Evidence**: [Database Overview](https://docs.convex.dev/database/overview), [Data Types](https://docs.convex.dev/database/types)

### Slide 04 — Schemaは型宣言ではなく実データの境界

**投影**

`schema.ts` → runtime validation → generated `Doc` / `Id` → function refs → client types

**図解**: 5段のtype chain。compile-timeとruntimeを別色で表示。

**Speaker notes**

- schemaはoptionalだが、本番例では定義する。
- TypeScript型はnetwork boundaryで消える。public functionの`args` / `returns` validatorsが必要。
- object validatorは余分なpropertyも拒否する。

**Life Pulse bridge**: `convex/schema.ts:25-95`。全体を見せた後、`studySessions`とindexだけを拡大。

**Evidence**: [Schemas](https://docs.convex.dev/database/schemas), [Validation](https://docs.convex.dev/functions/validation)

### Slide 05 — Indexは性能オプションではなくquery設計

**投影**

```ts
export const list = query({
  args: { ownerId: v.id("users") },
  returns: v.array(taskValidator),
  handler: async (ctx, args) =>
    ctx.db
      .query("tasks")
      .withIndex("by_owner_status", (q) => q.eq("ownerId", args.ownerId).eq("status", "todo"))
      .take(20),
});
```

**図解**: Full scanにcoral、bounded index rangeにgood。

**Speaker notes**

- `.filter()`は候補を読み取った後の絞り込みで、除外documentもscan/readに数えられる。
- index field順序、bounded result、paginationをquery contractとして決める。
- 大tableへのindex追加はstaged indexを使う。

**Evidence**: [Indexes](https://docs.convex.dev/database/reading-data/indexes), [Querying](https://docs.convex.dev/database/reading-data)

### Slide 06 — Queryは同じlogical timestampを読む

**投影**

> 一つのqueryが読んだ全documentは、同じlogical database snapshotに属する。

- deterministic read transaction
- automatic cache
- dependency tracking
- subscriptionの単位はquery result

**図解**: timestamp Tの縦線上に複数table readを置き、一つのresultへ束ねる。

**Speaker notes**

- 変更eventをclientが組み立てるモデルではない。
- TypeScriptで集計・relation traversalしても、戻り値単位で購読できる。

**Evidence**: [Query Functions](https://docs.convex.dev/functions/query-functions), [Realtime](https://docs.convex.dev/realtime)

### Slide 07 — Mutationはreadとwriteを一つにcommitする

**投影**

```ts
export const complete = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const task = await ctx.db.get("tasks", args.taskId);
    if (!task) throw new ConvexError("NOT_FOUND");
    await ctx.db.patch("tasks", task._id, { status: "done" });
    return null;
  },
});
```

**図解**: read → invariant → write → commit。throwからrollbackへ戻る矢印。

**Speaker notes**

- mutation内のwriteはall-or-nothing。
- React optimistic updateもserver error時にauthoritative resultへ戻る。
- action / HTTP actionはこのtransaction保証に含めない。

**Evidence**: [Mutation Functions](https://docs.convex.dev/functions/mutation-functions), [Error Handling](https://docs.convex.dev/functions/error-handling)

### Slide 08 — OCCがserializabilityと安全なretryを両立する

**投影**

`read set` + `write set` → conflict検出 → deterministic rerun → serializable commit

**図解**: 同じ在庫documentを読む2 mutationのtimeline。一方をcommit、他方を再実行。

**Speaker notes**

- optimistic concurrency control。
- query/mutationでexternal fetchを禁止する理由は、deterministic retryを守るため。
- contentionが多いshared documentはdata modelを分ける。

**Evidence**: [OCC and Atomicity](https://docs.convex.dev/database/advanced/occ), [Runtimes](https://docs.convex.dev/functions/runtimes)

### Slide 09 — Schema evolutionはexpand → backfill → contract

**投影**

1. optional field / staged indexを追加
2. Migrations componentでbounded batch backfill
3. readerを移行
4. validatorを必須化
5. old pathを除去

**図解**: live dataを止めない5段timeline。

**Speaker notes**

- SQL migration fileと同じ見た目ではないが、data migrationの問題は消えない。
- backup restoreは既存table dataを置換するdestructive operation。
- backupにcode、env、pending schedulesは含まれない。

**Evidence**: [Migrations](https://docs.convex.dev/database/writing-data#migrations), [Backup & Restore](https://docs.convex.dev/database/backup-restore)

### Slide 10 — Databaseの境界を先に知る

**投影**

| 得意                  | 先に検証                          |
| --------------------- | --------------------------------- |
| realtime OLTP         | OLAP / ad hoc SQL                 |
| bounded indexed reads | large scans                       |
| app transactions      | external side-effect exactly-once |
| reconnect             | durable offline-first             |
| typed API             | direct SQL / ORM portability      |

**図解**: good/amberの2カラムcard。

**Speaker notes**

- current transaction limitsは設計境界。料金枠とは別。
- 具体値はappendixに置き、発表直前に公式Limitsを再確認。

**Evidence**: [Limits](https://docs.convex.dev/production/state/limits), [Status and Guarantees](https://docs.convex.dev/production/state)

### Slide 11 — Checkpoint: Databaseで何が決まったか

**投影**

1. Data shape: document + typed relations
2. Read path: bounded indexes + consistent query
3. Write path: serializable mutation
4. Change path: safe evolution
5. Boundary: external I/Oとanalyticsは別

**Speaker notes**: 1分。聴衆に「queryとmutationの違い」を隣の人へ一文で説明してもらう。

---

## 3. Functions / Realtime — 15分

### Slide 12 — Function typeは保証の選択である

**投影**

| Type        | DB                   | Transaction | Reactive/cache        | External fetch |
| ----------- | -------------------- | ----------- | --------------------- | -------------- |
| query       | read                 | Yes         | Yes                   | No             |
| mutation    | read/write           | Yes         | resultとしてquery更新 | No             |
| action      | runQuery/runMutation | No          | No                    | Yes            |
| HTTP action | runQuery/runMutation | No          | No                    | Yes            |

**Speaker notes**

- 「すべてのfunctionがtransaction」は誤り。
- public/internalはnetwork exposureの境界。internalでもcaller側の認可設計は必要。

**Evidence**: [Functions](https://docs.convex.dev/functions/overview), [Internal Functions](https://docs.convex.dev/functions/internal-functions)

### Slide 13 — Clientはtableではなくquery resultを購読する

**投影**

```ts
const tasks = useQuery(api.tasks.list, { ownerId });

// Life Pulse production shape
return convexQuery(api.queries.dashboard.live.live, { dateJst });
```

**図解**: client → `tasks.list(args)` → read dependency set → result。

**Speaker notes**

- query name + argsがsubscription identity。
- Life Pulse: `src/features/dashboard/api/dashboard-live-query.ts:1-10`。
- frontendにWebSocket event reducerを書いていない点を見る。

**Evidence**: [React Client](https://docs.convex.dev/client/react/overview)

### Slide 14 — Mutation後の更新は依存queryの再計算

**投影**

`mutation commit` → `dependency invalidation` → `query rerun/cache update` → `WebSocket push` → `consistent client snapshot`

**図解**: 5段timeline。変更event payloadではなくquery resultが届くことを強調。

**Speaker notes**

- query subscriptionとmutationは別概念。
- 同じdataを読む複数queryは、一方だけ新しい中間UIを避けるよう同じlogical snapshotへ進む。

**Evidence**: [Realtime](https://docs.convex.dev/realtime), [Overview — Beyond reactivity](https://docs.convex.dev/understanding/overview#beyond-reactivity)

### Slide 15 — Cacheとoptimistic updateは別の層

**投影**

- Server cache: same query + args、dependencyでinvalidated
- Client optimistic update: authoritative resultまで一時的に書き換え
- Server error: rollbackしてserver resultへ置換

**図解**: server/clientの二層。optimistic overlayを半透明にする。

**Speaker notes**

- optimistic updaterはpureにする。query data更新時に再適用され得る。
- cached readのdatabase bandwidth課金については発表直前にpricing docsを確認。

**Evidence**: [Optimistic Updates](https://docs.convex.dev/client/react/optimistic-updates), [Realtime](https://docs.convex.dev/realtime)

### Slide 16 — External side effectはtransactionの外へ出す

**投影**

```text
client intent
  → mutation: durable state + runAfter(0)
  → internal action: external API
  → internal mutation: write-back
```

**図解**: transaction boundaryを囲み、actionだけ外側に置く。

**Speaker notes**

- mutationからのschedulingは親mutationとatomic。
- actionの外部副作用はautomatic retryされない。idempotency/retry policyが必要。
- Life Pulse: `convex/services/sessions/start.ts:22-70` と `convex/actions/garmin/syncDaily.ts:104-113`。

**Evidence**: [Actions](https://docs.convex.dev/functions/actions), [Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions)

### Slide 17 — Reconnectはoffline-firstではない

**投影**

| Built in                 | Separate design         |
| ------------------------ | ----------------------- |
| WebSocket reconnect      | persistent local DB     |
| in-memory mutation queue | restart後のwrite replay |
| connection state hook    | CRDT / conflict UI      |
| HTTP client option       | reactive HTTP response  |

**Speaker notes**

- HTTP client/APIは選べるがsubscriptionではない。
- `Date.now()`だけでqueryの期限状態を変えると、時間経過だけでは再実行されない。

**Evidence**: [React Client](https://docs.convex.dev/client/react/overview), [Best Practices](https://docs.convex.dev/understanding/best-practices)

### Slide 18 — Live Demo: Database commitが二つの画面を動かす

**投影**

1. 本人/パートナーのLive Boardを並べる
2. study sessionを開始
3. 両clientの更新を観察
4. dog taskを完了
5. Dashboard Logsを確認
6. architecture図へ戻る

**図解**: demo checklistとfallback screenshot枠。

**Speaker notes**

- 8分で停止。live codingはしない。
- 観察点: event handler不要、mutationとsubscriptionは別、snapshot consistency、public functionのauth guard。
- Source: `convex/queries/dashboard/live.ts:19-69`, `convex/mutations/dog/logEvent.ts:9-15`。

---

## 4. 本番機能 — 11分

### Slide 19 — Authenticationはidentity、Authorizationはapp code

**投影**

```ts
export const update = mutation({
  args: { displayName: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireSelf(ctx);
    await ctx.db.patch("appUsers", user._id, args);
    return null;
  },
});
```

**図解**: OIDC/JWT → verified identity → membership/ownership/role check → DB。

**Speaker notes**

- endpointはinternetに公開される。
- clientから来たuserId/emailを認可根拠にしない。
- Life Pulse: `convex/lib/auth.ts:62-117`。

**Evidence**: [Authentication](https://docs.convex.dev/auth/overview), [Auth in Functions](https://docs.convex.dev/auth/functions-auth)

### Slide 20 — Schedulerの保証は呼び出し元とtargetで変わる

**投影**

| Source / target     | Atomic with source | Retry model                  |
| ------------------- | ------------------ | ---------------------------- |
| mutation → schedule | Yes                | targetによる                 |
| action → schedule   | No                 | targetによる                 |
| scheduled mutation  | —                  | exactly-once                 |
| scheduled action    | —                  | at-most-once / no auto retry |

**Speaker notes**

- auth identityはscheduled functionへ自動伝播しない。
- cronはUTC。同一cronの前回runが長いと後続がskipされ得る。
- Life Pulse: `convex/crons.ts:14-22`。

**Evidence**: [Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions), [Cron Jobs](https://docs.convex.dev/scheduling/cron-jobs)

### Slide 21 — File URLはbearer capabilityである

**投影**

`upload URL mutation` → `client POST` → `storage ID` → `app document`

**Boundary card**

- `getUrl()`を知る人は追加認可なしで読める
- revokeはfile削除
- 動的認可が必要ならHTTP actionで毎回検査

**Speaker notes**: 「storageに置けばprivate」は誤り。access lifecycleから方式を選ぶ。

**Evidence**: [File Storage](https://docs.convex.dev/file-storage/overview), [Upload Files](https://docs.convex.dev/file-storage/upload-files)

### Slide 22 — Full-textとVectorはreactivityが違う

**投影**

|                 | Full-text        | Vector             |
| --------------- | ---------------- | ------------------ |
| Execute         | query            | action only        |
| Reactive result | Yes              | No                 |
| Index freshness | current          | current            |
| Typical use     | typeahead/filter | semantic retrieval |

**図解**: vector result IDs → query → reactive document fields。ただしmembership/rankingはaction再実行まで固定。

**Speaker notes**

- embedding modelはConvex coreに含まれない。
- vector searchと後続runQueryは一transactionではない。

**Evidence**: [Full Text Search](https://docs.convex.dev/search/text-search), [Vector Search](https://docs.convex.dev/search/vector-search)

### Slide 23 — Production readinessはplatformとappの共同責任

**投影**

| Platform             | App/team                   |
| -------------------- | -------------------------- |
| transactional DB     | authz rules                |
| reactive sync        | action idempotency         |
| deployment runtime   | RPO/RTO drill              |
| logs/health/insights | alerting/runbook           |
| backups option       | code/env/schedule recovery |

**Speaker notes**

- scaleはautomatic cachingだけでは決まらない。index、document size、hotspot、function limitsを見る。
- compliance、region、private networking、SLAは採用前に確認。

**Evidence**: [Production](https://docs.convex.dev/production/overview), [Security](https://www.convex.dev/security)

### Slide 24 — Checkpoint: Coreとapp責任を分ける

**投影**

- Convexが保証: query/mutation transaction、dependency sync、typed functions
- Appが設計: authorization、side-effect retry、offline、analytics、DR全体

**Speaker notes**: 1分。「actionに移した瞬間に失う保証」を一つ答えてもらう。

---

## 5. Components / AI / Testing / Operations — 12分

### Slide 25 — Componentはsandboxed backend module

**投影**

- functions + schema + persistent data
- explicit API boundary
- isolated storage/scheduler/env access
- top-level mutationとtransaction composition可能
- npm/lockfileでversion管理

**図解**: app shellの中にAgent/RAG/Workflow component sandbox。

**Speaker notes**

- 外部microserviceではない。
- componentのpublic functionをclientが直接呼ぶのではなく、app wrapperを公開する。

**Evidence**: [Components](https://docs.convex.dev/components/overview), [Understanding Components](https://docs.convex.dev/components/understanding)

### Slide 26 — Ecosystemはcoreとoptionalを混ぜない

**投影**

| Need          | Option                               |
| ------------- | ------------------------------------ |
| auth          | Convex Auth / external OIDC          |
| workflows     | Workflow / Workpool / Action Retrier |
| AI state      | Agent / RAG                          |
| rate control  | Rate Limiter                         |
| billing/email | Stripe / Resend components           |
| migrations    | Migrations                           |

**Speaker notes**

- official catalog掲載とproduction maturityは同義ではない。
- componentごとにlicense、version、upgrade path、external costを確認。

**Evidence**: [Official Components catalog](https://www.convex.dev/components/get-convex.md)

### Slide 27 — AIは「開発するAI」と「製品内AI」に分ける

**投影**

| AI coding infrastructure | AI app runtime               |
| ------------------------ | ---------------------------- |
| AI files / skills        | Agent component              |
| MCP / plugins            | RAG component                |
| deterministic codegen    | Workflow / tools / streaming |
| dev deployment feedback  | model API integration        |

**Speaker notes**

- `_generated`のcodegenはAIではない。
- plugin/MCPはtestやhuman reviewの代わりではない。
- production credential/PIIをデモに出さない。

**Evidence**: [AI Code Generation](https://docs.convex.dev/ai/overview), [Agent Skills](https://docs.convex.dev/ai/agent-skills), [Convex MCP](https://docs.convex.dev/ai/convex-mcp-server)

### Slide 28 — Agent / RAG / Workflowは役割が違う

**投影**

- **Agent**: threads、messages、tools、streaming、usage
- **RAG**: chunks、embeddings、namespaces、retrieval
- **Workflow**: durable multi-step orchestration、retry、status
- **Core vector search**: nearest-neighbor primitive

**図解**: user message → Agent → RAG/tool → Workflow → app mutation。

**Speaker notes**: すべてを「AI機能」と一括りにせず、stateとguaranteeで分ける。

**Evidence**: [Agents](https://docs.convex.dev/agents/overview), [Agent source](https://github.com/get-convex/agent), [RAG source](https://github.com/get-convex/rag), [Workflow source](https://github.com/get-convex/workflow)

### Slide 29 — Testはtransaction境界と失敗側を書く

**投影**

```ts
const t = convexTest(schema, modules);
const owner = t.withIdentity({ subject: "owner" });
const stranger = t.withIdentity({ subject: "stranger" });

await owner.mutation(api.tasks.complete, { taskId });
await expect(stranger.mutation(api.tasks.complete, { taskId })).rejects.toThrow();
```

**Speaker notes**

- `convex-test`: fast function/data/authz test。
- local backend: runtime/backend integration。
- actionはexternal API mockだけでなくidempotency/retry境界をtest。
- Life Pulse: `convex/mutations/dog/logEvent.test.ts:9-92`。

**Evidence**: [Testing](https://docs.convex.dev/testing/overview), [convex-test](https://docs.convex.dev/testing/convex-test)

### Slide 30 — Deployして終わりではなく、insightsまで一周する

**投影**

`dev deployment` → `preview/staging` → `typecheck/deploy` → `logs + request ID` → `health/insights` → `index/data model fix`

**Speaker notes**

- preview deploymentsなどbeta statusは発表直前に確認。
- usage guardrailsはspend capではなく、resource usageを止め得る運用機能として扱う。
- self-hostは同じlineageでもinfra/HA/backup/upgrade/supportが利用者責任。

**Evidence**: [Deployments](https://docs.convex.dev/production/hosting), [Monitoring](https://docs.convex.dev/production/integrations/log-streams), [Self Hosting](https://docs.convex.dev/self-hosting)

---

## 6. 採用判断・まとめ — 10分

### Slide 31 — 比較は「SQLかNoSQLか」では足りない

**投影**

比較軸:

1. authoritative data model / direct SQL
2. transaction boundary
3. realtime semantics
4. server runtimeとtype path
5. authorization model
6. offline / analytics
7. portability / self-host
8. operational ownership

**図解**: Convex、Firestore、Supabase、Postgres+APIの4列比較。勝敗ではなくtrade-off card。

**Speaker notes**: 詳細比較表は次スライド。各製品の公式資料で確認できる契約だけを記載する。

### Slide 32 — Convexの優位は統合された保証、制約は境界の選択

**投影**

|             | Convex                      | Firestore                  | Supabase                   | Postgres + API         |
| ----------- | --------------------------- | -------------------------- | -------------------------- | ---------------------- |
| Data/API    | typed functions + documents | document DB SDK            | Postgres + generated APIs  | SQL + chosen API layer |
| Realtime    | query dependency/result     | snapshot listeners         | Postgres changes/broadcast | architecture choice    |
| Transaction | query/mutation              | client/server transactions | Postgres transaction       | DB/API design          |
| Authz       | function code               | Security Rules/server      | RLS/policies               | API/RLS design         |
| Offline     | reconnect/in-memory queue   | client offline persistence | client-specific design     | architecture choice    |
| Portability | cloud/self-host trade-off   | managed ecosystem          | Postgres/self-host options | highest control/ops    |

**Speaker notes**

- 行ごとに前提が違うため、単純な点数化をしない。
- 比較対象の一次資料URLは「比較一次資料」にまとめる。

### Slide 33 — Fit: shared stateを短いfeedback loopで作りたい

**投影**

- collaborative / operational UI
- TypeScript end-to-endの小〜中規模team
- transactionとreactive read modelを同じ境界で扱う
- scheduler、file、search、AI stateを同じplatformへ寄せる
- dev deployment + generated APIでagentic coding loopを短くする

**図解**: 5つのgood chip。

**Speaker notes**: 「小規模専用」ではなく、fitはworkloadとteam operating modelで判断する。

**Evidence**: [Convex Overview](https://docs.convex.dev/understanding/overview), [Status and Guarantees](https://docs.convex.dev/production/state)

### Slide 34 — Non-fitを説明できて、初めて採用判断になる

**投影**

先にprototype/contract確認:

- durable offline/local-first
- OLAP、ad hoc SQL、large scans
- direct SQL / existing ORM ecosystemが必須
- strict region/network/SLA/RPO/RTO/compliance
- external side-effect exactly-onceがbusiness critical
- unsupported first-party reactive client

**Closing line**

> Databaseの保証を中心に置き、境界の外を自分たちで所有できるなら、Convexは強い。

**Speaker notes**

- 最後にadoption checklist: representative query、hotspot、authz negative test、action retry、backup drill、cost driver。
- 次の一歩はtasks appを作り、同じqueryを2画面で購読すること。

**Evidence**: [Limits](https://docs.convex.dev/production/state/limits), [Pricing](https://www.convex.dev/pricing)

### Slide 35 — Q&A

**投影**

中央にDatabase、周囲に今日の6語:

`document-relational` / `transaction` / `query subscription` / `action boundary` / `authorization` / `fit`

右下にQRまたは短縮リンク用の空き領域:

- Convex docs
- Life Pulse source
- appendix / references

**Speaker notes**: 8分。質問を「Database」「Functions/Realtime」「Production」「Adoption」のどこに属するか置いてから答える。

---

## デモ実行表

| 時刻  | 操作                      | 観察                           | 失敗時fallback       |
| ----- | ------------------------- | ------------------------------ | -------------------- |
| 00:00 | 2つの認証済みwindowを表示 | 同じLive Board snapshot        | 事前capture          |
| 01:00 | 本人がsession開始         | 自分/partnerのsession card更新 | mutation/log capture |
| 03:00 | dog task完了              | 両画面のtask chip更新          | before/after capture |
| 05:00 | Dashboard Logs            | query/mutation path            | logs screenshot      |
| 06:30 | architecture図へ戻る      | commit→rerun→pushを復唱        | 静的timeline         |
| 08:00 | 終了                      | production章へ移る             | 強制終了             |

## OpenDesign生成時の検収基準

1. 35枚すべてに一意な結論タイトルがある。
2. Databaseが最大の章で、Slide 03–10に20分が割り当てられている。
3. Core / Official optional / Third-partyのbadgeが混同なく付く。
4. query、mutation、action、HTTP actionのtransaction/reactivity境界が正しい。
5. query subscriptionとmutation後のreactive updateを別概念として描く。
6. authn/authz、full-text/vector、AI coding/AI runtimeを対比して混同を防ぐ。
7. 利点だけのスライドを作らず、同じ章にboundaryを置く。
8. code blockは16行以内、Life Pulse path/rangeはspeaker notesに残る。
9. 一次資料名が各slide、完全URLがnotesまたは本ファイルに残る。
10. 72分本編 + 2分checkpoint + 8分demo + 8分Q&A = 90分を超えない。
11. デモ失敗時fallbackが生成物のspeaker notesに残る。
12. 16:9、dark、JetBrains Mono、card/inset/status chipのLive Board言語を維持する。

## 発表直前freshness check

発表前24時間以内に、次を公式ページで再確認し、変更があれば該当slideとspeaker notesを更新する。

- [Limits](https://docs.convex.dev/production/state/limits): transaction、function、search、scheduling、storage
- [Pricing](https://www.convex.dev/pricing): free/pro枠、bandwidth、action compute、vector/storage
- [Components catalog](https://www.convex.dev/components/get-convex.md): official/community、component maturity
- [Convex Auth](https://docs.convex.dev/auth/convex-auth): beta status
- [Deployments](https://docs.convex.dev/production/hosting): preview/staging status
- [Data Import & Export](https://docs.convex.dev/database/import-export): beta/statusとsupported formats
- [Convex MCP](https://docs.convex.dev/ai/convex-mcp-server): production access、permissions、CLI flags
- [OpenAPI](https://docs.convex.dev/client/open-api): beta/status

更新記録には確認時刻（JST）、URL、変更有無、変更したslide番号を残す。数値が確認できない場合は本編から数値を外し、概念的な設計境界だけを残す。

## 比較一次資料

比較表は各製品を勝敗で順位づけず、公式に説明される契約と利用者が所有する設計範囲を比較する。

### Firebase / Firestore

- [Data model](https://firebase.google.com/docs/firestore/data-model): collection/document/subcollection
- [Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions): atomic transaction、contention時の再実行、offline時のclient transaction制約
- [Realtime queries at scale](https://firebase.google.com/docs/firestore/real-time_queries_at_scale): snapshot listenerとcommit order
- [Offline data](https://firebase.google.com/docs/firestore/manage-data/enable-offline): persistent local cache、reconnect後sync、last-write-wins
- [Security overview](https://firebase.google.com/docs/firestore/security/overview): Security Rules / IAM
- [Emulator Suite](https://firebase.google.com/docs/emulator-suite): production self-host用途ではない

### Supabase

- [Database overview](https://supabase.com/docs/guides/database/overview): full Postgres、SQL、connections
- [Architecture](https://supabase.com/docs/guides/getting-started/architecture): Postgresを中心とするservice構成
- [Realtime database changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes): Broadcast / Postgres Changes、row-change event
- [Edge Functions](https://supabase.com/docs/guides/functions): Deno-compatible TypeScript runtime
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security): policyとservice-role bypass
- [Self-hosting](https://supabase.com/docs/guides/self-hosting): self-host時の機能差と運用責任
- [PowerSync integration](https://supabase.com/partners/integrations/powersync), [ElectricSQL integration](https://supabase.com/partners/integrations/electricsql): durable offlineはcore外の選択肢

### PostgreSQL + API

- [PostgreSQL tutorial](https://www.postgresql.org/docs/18/tutorial.html): relational modelとSQL
- [Transaction isolation](https://www.postgresql.org/docs/18/transaction-iso.html): Read CommittedからSerializableまで
- [LISTEN](https://www.postgresql.org/docs/18/sql-listen.html), [NOTIFY](https://www.postgresql.org/docs/18/sql-notify.html): commit後notification
- [Logical replication](https://www.postgresql.org/docs/18/logical-replication.html): durable change streamを構成するprimitive
- [Row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html): database policyとbypass条件
- [Client interfaces](https://www.postgresql.org/docs/18/external-interfaces.html): HTTP API、auth、client syncは別layer
- [PostgreSQL License](https://www.postgresql.org/about/licence/): portability/self-hostの前提

### 比較表の読み上げ規則

- Firestoreはoffline-first、SupabaseはPostgres互換性、PostgreSQL + APIは自由度という固有の強みを先に述べる。
- Convexの差は「NoSQL」ではなく、serializable mutation、TypeScript backend、query-result subscriptionの統合として説明する。
- Supabase RealtimeとPostgreSQL LISTEN/NOTIFYをConvex query subscriptionと同一視しない。
- PostgreSQL + API列は単一製品の仕様ではなく、DB primitiveに選択したAPI/runtimeを組み合わせる構成であると明示する。

## Convex主要一次資料

- [Understanding Convex](https://docs.convex.dev/understanding/overview)
- [Database](https://docs.convex.dev/database/overview)
- [Functions](https://docs.convex.dev/functions/overview)
- [Realtime](https://docs.convex.dev/realtime)
- [Authentication](https://docs.convex.dev/auth/overview)
- [Scheduling](https://docs.convex.dev/scheduling/overview)
- [File Storage](https://docs.convex.dev/file-storage/overview)
- [Search](https://docs.convex.dev/search)
- [Components](https://docs.convex.dev/components/overview)
- [AI Code Generation](https://docs.convex.dev/ai/overview)
- [Testing](https://docs.convex.dev/testing/overview)
- [Production](https://docs.convex.dev/production/overview)
- [Limits](https://docs.convex.dev/production/state/limits)

## Life Pulse source map

- `convex/schema.ts:25-95`
- `convex/queries/dashboard/live.ts:19-69`
- `src/features/dashboard/api/dashboard-live-query.ts:1-10`
- `convex/services/sessions/start.ts:22-70`
- `convex/lib/auth.ts:62-117`
- `convex/actions/garmin/syncDaily.ts:47-116`
- `convex/mutations/dog/logEvent.test.ts:9-92`
- `convex/crons.ts:14-22`
