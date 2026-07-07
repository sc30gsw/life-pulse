import { convexTest } from "convex-test";
import { expect, test, vi } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("ends the active window, deriving actualMinutes from elapsed time", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(0);

  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {
    targetMinutes: 60,
  });

  vi.advanceTimersByTime(600_000);
  await asSelf.mutation(api.mutations.fasting.end.end, {});

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.status).toBe("ended");
  expect(window?.endedAt).toBe(600_000);
  expect(window?.actualMinutes).toBe(10);

  vi.useRealTimers();
});

test("cancels the scheduled phase jobs so they no longer fire after end", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(0);

  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {
    targetMinutes: 60,
  });

  await asSelf.mutation(api.mutations.fasting.end.end, {});

  // drive the fake-timer scheduler past when both the fatburn (30min) and
  // goal (60min) jobs would have fired, proving the canceled jobs never run
  await t.finishAllScheduledFunctions(vi.runAllTimers);

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.phase).toBe("early");
  expect(window?.status).toBe("ended");

  vi.useRealTimers();
});

test("rejects ending when there is no active fasting window", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(asSelf.mutation(api.mutations.fasting.end.end, {})).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.mutation(api.mutations.fasting.end.end, {})).rejects.toThrow();
});
