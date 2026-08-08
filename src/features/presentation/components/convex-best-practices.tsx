import { Accordion, Alert, Badge, Button, Group, Progress, Stack, Text } from "@mantine/core";
import {
  IconArrowLeft,
  IconBook2,
  IconBrandGithub,
  IconCheck,
  IconDatabase,
  IconExternalLink,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Practice = {
  code?: string;
  id: string;
  label: string;
  lead: string;
  source: { label: string; url: string };
  title: string;
  why: string;
};

const practices: Practice[] = [
  {
    code: `const tasks = await ctx.db\n  .query("tasks")\n  .withIndex("by_owner_status", (q) =>\n    q.eq("ownerId", ownerId).eq("status", "todo"),\n  )\n  .take(20);`,
    id: "bounded-reads",
    label: "DATABASE",
    lead: "indexで探索範囲を決め、takeまたはpaginateで返却量を契約にする。",
    source: {
      label: "Best Practices · Indexes",
      url: "https://docs.convex.dev/understanding/best-practices",
    },
    title: "readをboundedにする",
    why: "大きくなるtableでfilterや無制限collectに依存すると、読み取り量とtransaction limitがデータ量に引きずられます。",
  },
  {
    code: `export const complete = mutation({\n  args: { taskId: v.id("tasks") },\n  returns: v.null(),\n  handler: async (ctx, { taskId }) => {\n    await ctx.db.patch("tasks", taskId, { done: true });\n    return null;\n  },\n});`,
    id: "validators",
    label: "FUNCTIONS",
    lead: "public/internalを問わず、すべてのfunctionにargs validatorを置く。returnsも境界を固定したい場所で定義する。",
    source: { label: "Function Validation", url: "https://docs.convex.dev/functions/validation" },
    title: "runtime境界をvalidatorで閉じる",
    why: "TypeScript型はnetwork boundaryでは実行されません。validatorが実データとgenerated APIをつなぐruntime contractです。",
  },
  {
    code: `const identity = await ctx.auth.getUserIdentity();\nif (!identity) throw new ConvexError("UNAUTHENTICATED");\n\nconst ownerKey = identity.tokenIdentifier;`,
    id: "authz",
    label: "AUTHORIZATION",
    lead: "authorization用のuserIdをclient引数から受け取らず、ctx.authからidentityを導出する。",
    source: { label: "Authorization", url: "https://docs.convex.dev/auth/authorization" },
    title: "identityをserverで確定する",
    why: "public functionはインターネットから直接呼べます。認証済みかだけでなく、対象documentを操作できるかをfunctionごとに確認します。",
  },
  {
    code: `client intent\n  → mutation: durable state + await runAfter(0)\n  → internal action: external API\n  → internal mutation: write-back`,
    id: "actions",
    label: "WORKFLOW",
    lead: "外部I/Oはactionへ出す。ただしbrowserからactionを直接呼ぶ設計を初手にしない。",
    source: { label: "The Zen of Convex", url: "https://docs.convex.dev/understanding/zen" },
    title: "actionをdurable workflowにする",
    why: "mutationで意図と進捗を保存してからscheduleすると、UIはqueryで状態を追えます。外部副作用にはidempotencyとretry方針が必要です。",
  },
  {
    id: "light-functions",
    label: "SYNC ENGINE",
    lead: "query/mutationは数百record未満、100ms未満を目安に軽く保ち、actionは必要な場所だけで使う。",
    source: { label: "The Zen of Convex", url: "https://docs.convex.dev/understanding/zen" },
    title: "sync engineに仕事を寄せすぎない",
    why: "小さいdeterministic transactionはcache、reactivity、OCC retryの利点を最大化します。batchや外部連携は段階的なworkflowへ分解します。",
  },
  {
    id: "time",
    label: "DETERMINISM",
    lead: "query内のDate.now()を状態変化のトリガーとして扱わない。現在時刻が必要なら引数またはscheduled stateで明示する。",
    source: {
      label: "Best Practices · Date.now",
      url: "https://docs.convex.dev/understanding/best-practices",
    },
    title: "reactivityが追跡できる依存だけを読む",
    why: "時間が進んでもdatabase dependencyは変わらないため、購読queryは自動再実行されません。cache効率も落とします。",
  },
  {
    id: "data-model",
    label: "DATA MODEL",
    lead: "unboundedな子要素を配列へ詰めず別tableにする。presenceなどhigh-churn dataはstable profileから分離する。",
    source: {
      label: "Database · Data Modeling",
      url: "https://docs.convex.dev/database/advanced/data-modeling",
    },
    title: "更新頻度と成長方向でtableを分ける",
    why: "document上限だけでなく、同じdocumentへのread/write集中がcontentionを生みます。relationを使ってhotspotを小さくします。",
  },
  {
    id: "internal",
    label: "EXPOSURE",
    lead: "scheduler、cron、ctx.run*のtargetはinternal functionにする。共有logicはplain TypeScript helperへ置く。",
    source: {
      label: "Best Practices · Internal Functions",
      url: "https://docs.convex.dev/understanding/best-practices",
    },
    title: "public API面を小さく保つ",
    why: "public functionは入力・認可・rate abuseを監査する対象です。内部だけで呼ぶ処理をapiへ公開する理由はありません。",
  },
  {
    id: "promises",
    label: "CORRECTNESS",
    lead: "ctx.db、ctx.scheduler、ctx.run*を含むPromiseを必ずawaitする。no-floating-promisesで自動検査する。",
    source: {
      label: "Best Practices · Await Promises",
      url: "https://docs.convex.dev/understanding/best-practices",
    },
    title: "すべての副作用をawaitする",
    why: "未awaitのscheduleやwriteはfunction完了後の実行を保証されず、失敗も観測できません。",
  },
  {
    code: `const owner = t.withIdentity({\n  subject: "owner",\n  issuer: "test",\n});\nconst stranger = t.withIdentity({\n  subject: "stranger",\n  issuer: "test",\n});`,
    id: "tests",
    label: "TESTING",
    lead: "成功pathだけでなく、未認証・別owner・不正遷移をconvex-testで拒否できることを確認する。",
    source: { label: "Testing Convex", url: "https://docs.convex.dev/testing/overview" },
    title: "authorizationの失敗側を書く",
    why: "型検査は権限漏れを検出しません。negative authz testをfunction contractの一部にします。",
  },
];

const databaseContract = [
  {
    detail: "接続設定もDDLも不要。最初のinsertでtableが生まれ、SQL / ORMなしで読み書きできます。",
    label: "ZERO SETUP",
    title: "table-on-insert",
    url: "https://docs.convex.dev/database/overview",
  },
  {
    detail: "JSON-like documentをtyped Document IDで関連づける、document-relational modelです。",
    label: "DATA MODEL",
    title: "documents + relations",
    url: "https://docs.convex.dev/database/document-ids",
  },
  {
    detail:
      "schemaなしでも開始できます。本番ではruntime validationとgenerated typesの契約として定義します。",
    label: "SCHEMA",
    title: "optional, then precise",
    url: "https://docs.convex.dev/database/schemas",
  },
  {
    detail: "index、paginated query、import / exportを、データ量の成長に合わせて使えます。",
    label: "GROWTH",
    title: "bounded by design",
    url: "https://docs.convex.dev/database/reading-data/indexes",
  },
  {
    detail:
      "依存dataが変わるまでquery resultを自動cache。cached readはdatabase bandwidthを消費しません。",
    label: "CACHE",
    title: "automatic + free reads",
    url: "https://docs.convex.dev/realtime",
  },
  {
    detail:
      "全client subscriptionを同時に同じdatabase snapshotへ更新し、中間状態の食い違いを避けます。",
    label: "REALTIME",
    title: "one consistent snapshot",
    url: "https://docs.convex.dev/realtime",
  },
];

function DocsCallout({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warning";
}) {
  const warning = tone === "warning";

  return (
    <Alert
      className={`border ${warning ? "border-amber/35 bg-amber/8" : "border-blue/35 bg-blue/8"}`}
      color={warning ? "var(--amber)" : "var(--blue)"}
      icon={warning ? <IconShieldCheck size={18} /> : <IconBook2 size={18} />}
      radius="md"
      variant="transparent"
    >
      {children}
    </Alert>
  );
}

function ArchitectureStack() {
  return (
    <div className="grid gap-2 text-center text-[11px] font-bold tracking-[0.12em] uppercase sm:text-xs">
      <div className="border-blue/45 bg-blue/8 text-blue rounded-lg border px-4 py-3">
        React clients · subscribe to query results
      </div>
      <div className="text-faint flex items-center justify-center gap-2">
        <span>calls</span>
        <span aria-hidden>↓</span>
        <span>pushes consistent snapshots</span>
      </div>
      <div className="border-violet/45 bg-violet/8 text-violet rounded-lg border px-4 py-3">
        TypeScript functions · query / mutation / action
      </div>
      <div className="text-faint flex items-center justify-center gap-2">
        <span>reads</span>
        <span aria-hidden>↓</span>
        <span>commits</span>
      </div>
      <div className="border-good bg-good/10 text-good rounded-xl border px-4 py-5 text-sm shadow-[0_0_40px_color-mix(in_oklab,var(--good)_14%,transparent)] sm:text-base">
        <IconDatabase className="mr-2 inline" size={19} /> Database · deterministic reactive state
      </div>
    </div>
  );
}

function BestPracticesHeader() {
  return (
    <header className="border-bd bg-bg/92 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-7">
        <Group gap={10} mr="auto">
          <span className="bg-good h-2.5 w-2.5 rounded-full shadow-[0_0_12px_var(--good)]" />
          <Stack gap={0}>
            <Text className="lp-brandtext" fw={700} size="md">
              Convex Field Guide
            </Text>
            <Text
              c="var(--faint)"
              fw={600}
              size="9px"
              tt="uppercase"
              style={{ letterSpacing: "0.14em" }}
            >
              official docs × agent guidelines
            </Text>
          </Stack>
        </Group>
        <Button
          className="border-bd-2 bg-inset text-tx hover:bg-panel-2"
          component={Link}
          leftSection={<IconArrowLeft size={15} />}
          radius="md"
          size="xs"
          to="/presentation"
          variant="default"
        >
          Presentation
        </Button>
      </div>
    </header>
  );
}

function BestPracticesHero() {
  return (
    <>
      <section className="border-bd-2 bg-panel shadow-card presentation-grid relative overflow-hidden rounded-2xl border p-5 sm:p-8">
        <div className="relative z-10 grid gap-8 md:grid-cols-[1.02fr_0.98fr] md:items-center">
          <div>
            <Badge
              className="border-good/45 bg-good/12 text-good border"
              radius="sm"
              variant="transparent"
            >
              DATABASE FIRST
            </Badge>
            <h1 className="mt-5 text-3xl leading-[1.08] font-bold tracking-[-0.05em] text-balance sm:text-5xl">
              Convexらしく考える。
            </h1>
            <p className="text-dim mt-5 max-w-[48ch] text-sm leading-7 sm:text-base">
              Reactivityは付加機能ではありません。Databaseのdeterministicな状態を、軽いTypeScript
              functionとquery subscriptionで画面へ届けることが設計の中心です。
            </p>
            <Group gap="sm" mt="xl">
              <Button
                component="a"
                href="https://docs.convex.dev/understanding/overview"
                leftSection={<IconExternalLink size={15} />}
                radius="md"
                rel="noreferrer"
                style={{ backgroundColor: "var(--good)", color: "var(--bg)" }}
                target="_blank"
              >
                Convex Overview
              </Button>
              <Button
                className="border-bd-2 bg-inset text-tx hover:bg-panel-2"
                component="a"
                href="https://docs.convex.dev/understanding/best-practices"
                leftSection={<IconBook2 size={15} />}
                radius="md"
                rel="noreferrer"
                target="_blank"
                variant="default"
              >
                Official practices
              </Button>
            </Group>
          </div>
          <ArchitectureStack />
        </div>
      </section>

      <section aria-labelledby="database-realtime-contract" className="my-8">
        <Group align="baseline" gap="sm" mb="md">
          <Text c="var(--good)" fw={700} size="xs">
            00
          </Text>
          <h2
            className="m-0 text-sm font-bold tracking-[0.1em] uppercase"
            id="database-realtime-contract"
          >
            Database + Realtime contract
          </h2>
        </Group>
        <div className="grid gap-3 sm:grid-cols-2">
          {databaseContract.map((item) => (
            <a
              className="border-bd-2 bg-inset hover:border-good/55 group rounded-xl border p-4 no-underline transition"
              href={item.url}
              key={item.title}
              rel="noreferrer"
              target="_blank"
            >
              <Group justify="space-between">
                <Text
                  c="var(--good)"
                  fw={700}
                  size="9px"
                  tt="uppercase"
                  style={{ letterSpacing: "0.14em" }}
                >
                  {item.label}
                </Text>
                <IconExternalLink className="text-faint group-hover:text-good" size={13} />
              </Group>
              <Text c="var(--tx)" fw={700} mt={6} size="sm">
                {item.title}
              </Text>
              <Text c="var(--dim)" mt={7} size="xs" style={{ lineHeight: 1.75 }}>
                {item.detail}
              </Text>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

export function ConvexBestPracticesPage() {
  return (
    <div className="min-h-dvh">
      <BestPracticesHeader />

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-8 px-4 py-8 sm:px-7 lg:grid-cols-[220px_minmax(0,760px)] xl:grid-cols-[220px_minmax(0,760px)_220px]">
        <aside className="hidden lg:block">
          <nav aria-label="ベストプラクティス一覧" className="sticky top-24">
            <Text
              c="var(--faint)"
              fw={700}
              mb="sm"
              size="10px"
              tt="uppercase"
              style={{ letterSpacing: "0.14em" }}
            >
              On this page
            </Text>
            <ul className="m-0 grid list-none gap-1 p-0">
              {practices.map((practice, index) => (
                <li key={practice.id}>
                  <a
                    className="text-dim hover:border-good hover:bg-good/6 hover:text-tx border-bd block border-l px-3 py-2 text-[11px] leading-[1.45] no-underline transition"
                    href={`#${practice.id}`}
                  >
                    <span className="text-faint mr-2">{String(index + 1).padStart(2, "0")}</span>
                    {practice.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0">
          <BestPracticesHero />

          <DocsCallout>
            <strong>読み方:</strong> 公式Convex Docsの推奨を土台に、インストール済みConvex agent
            guidelinesのより厳しい生成規則を重ねています。両者が異なる場合はラベルで区別します。
          </DocsCallout>

          <div className="my-10 flex items-center gap-3">
            <span className="text-good text-xs font-bold">01—10</span>
            <div className="bg-bd h-px flex-1" />
            <span className="text-faint text-[10px] font-semibold tracking-[0.14em] uppercase">
              Production checklist
            </span>
          </div>

          <div className="grid gap-5">
            {practices.map((practice, index) => (
              <article
                className="border-bd-2 bg-panel shadow-card scroll-mt-24 rounded-2xl border p-5 sm:p-7"
                id={practice.id}
                key={practice.id}
              >
                <Group align="flex-start" gap="md" wrap="nowrap">
                  <span className="border-good/40 bg-good/8 text-good flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Text
                      c="var(--faint)"
                      fw={700}
                      size="9px"
                      tt="uppercase"
                      style={{ letterSpacing: "0.15em" }}
                    >
                      {practice.label}
                    </Text>
                    <h2 className="m-0 mt-1 text-xl font-bold tracking-[-0.035em] sm:text-2xl">
                      {practice.title}
                    </h2>
                  </div>
                  <IconCheck className="text-good hidden shrink-0 sm:block" size={19} />
                </Group>

                <p className="mt-5 text-sm leading-7 font-semibold sm:text-base">{practice.lead}</p>
                <p className="text-dim mt-3 text-sm leading-7">{practice.why}</p>

                {practice.code ? (
                  <pre className="border-bd-2 bg-inset mt-5 overflow-x-auto rounded-xl border p-4 text-[11px] leading-6 sm:text-xs">
                    <code>{practice.code}</code>
                  </pre>
                ) : null}

                <a
                  className="text-blue decoration-blue/35 mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold underline underline-offset-4"
                  href={practice.source.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {practice.source.label} <IconExternalLink size={13} />
                </a>
              </article>
            ))}
          </div>

          <section className="border-amber/35 bg-amber/6 mt-10 rounded-2xl border p-5 sm:p-7">
            <Badge
              className="border-amber/45 bg-amber/10 text-amber border"
              radius="sm"
              variant="transparent"
            >
              CONVEX AGENT GUIDELINES
            </Badge>
            <h2 className="mt-4 text-xl font-bold">このプロジェクトで追加する厳格ルール</h2>
            <ul className="text-dim marker:text-amber mt-4 grid gap-3 pl-5 text-sm leading-7">
              <li>queryでは.filterを使わず、index + withIndexを標準にする。</li>
              <li>指定がなければcollectionをboundedにし、countはdenormalized counterで持つ。</li>
              <li>auth-linked lookupにはidentity.tokenIdentifierをcanonical keyとして使う。</li>
              <li>high-churn operational dataをstable profile documentから分離する。</li>
              <li>authorization testはowner成功だけでなくstranger拒否まで書く。</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold">判断に迷ったとき</h2>
            <Accordion
              classNames={{
                content: "text-dim leading-7 text-sm",
                control: "text-tx hover:bg-panel-2 rounded-lg",
                item: "border-bd-2 bg-panel mb-2 rounded-xl border px-2",
              }}
              mt="md"
              variant="separated"
            >
              <Accordion.Item value="query-action">
                <Accordion.Control>query / mutation / actionのどれを使う？</Accordion.Control>
                <Accordion.Panel>
                  readはquery、transactionalなread/writeはmutation、外部I/Oだけaction。actionでDBへ触るときはrunQuery/runMutationを使い、連続呼び出しを減らします。
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="collect">
                <Accordion.Control>collectは全面禁止？</Accordion.Control>
                <Accordion.Panel>
                  いいえ。index範囲が自然に小さいと保証できる場合は有効です。成長が読めないcollectionではtake/paginate、集計ではdenormalizationを選びます。
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="component">
                <Accordion.Control>Componentをいつ使う？</Accordion.Control>
                <Accordion.Panel>
                  rate
                  limit、workflow、agent、RAGなど、独立したstateとinterfaceを持つ機能に向きます。Componentはapp
                  tableへ暗黙アクセスできないsandboxed backend moduleです。
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </section>

          <DocsCallout tone="warning">
            発表や採用判断の直前には、Limits、Pricing、Components catalog、beta
            statusを公式ページで再確認してください。数値は設計原則より早く変わります。
          </DocsCallout>

          <footer className="border-bd mt-10 border-t py-8">
            <Group justify="space-between" align="center" wrap="wrap">
              <div>
                <Text fw={700}>Databaseから始める。</Text>
                <Text c="var(--faint)" mt={3} size="xs">
                  Convex Docsの構造を、Life Pulseのdark card languageで再構成。
                </Text>
              </div>
              <Button
                className="border-bd-2 bg-inset text-tx hover:bg-panel-2"
                component="a"
                href="https://github.com/get-convex"
                leftSection={<IconBrandGithub size={15} />}
                radius="md"
                rel="noreferrer"
                target="_blank"
                variant="default"
              >
                get-convex
              </Button>
            </Group>
          </footer>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <Text
              c="var(--faint)"
              fw={700}
              mb="sm"
              size="10px"
              tt="uppercase"
              style={{ letterSpacing: "0.14em" }}
            >
              Readiness
            </Text>
            <div className="border-bd-2 bg-panel rounded-xl border p-4">
              <Group justify="space-between" mb="xs">
                <Text size="xs">Core contract</Text>
                <Text c="var(--good)" fw={700} size="xs">
                  10 / 10
                </Text>
              </Group>
              <Progress color="var(--good)" radius="xl" size="sm" value={100} />
              <Stack gap="xs" mt="md">
                {[
                  "bounded reads",
                  "runtime validation",
                  "server-side identity",
                  "durable workflows",
                  "negative authz tests",
                ].map((item) => (
                  <Group gap={7} key={item} wrap="nowrap">
                    <IconCheck className="text-good shrink-0" size={13} />
                    <Text c="var(--dim)" size="10px">
                      {item}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
