// Standalone Node 24 script — NOT part of the Convex or Vite build.
// Run locally with: node scripts/garmin-login.ts
//
// Prompts for Garmin credentials, logs in via garmin-connect-sdk, and prints the
// resulting token JSON to stdout. Never writes the token to disk.
//
// After it prints, set the token on the Convex deployment with:
//   npx convex env set GARMIN_TOKENS_JSON '<paste the printed JSON here>'

import { stderr, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import { GarminConnectSDK, MemoryTokenStorage } from "garmin-connect-sdk";

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  const email = await rl.question("Garmin email: ");
  const password = await rl.question("Garmin password: ");
  const mfaCodeInput = await rl.question("MFA code (leave blank if not requested): ");

  rl.close();

  const storage = new MemoryTokenStorage();
  const garmin = new GarminConnectSDK({ storage });

  await garmin.login({
    email,
    password,
    mfaCode: mfaCodeInput.trim() === "" ? undefined : mfaCodeInput.trim(),
  });

  const tokens = await storage.load();

  if (!tokens) {
    throw new Error("Login succeeded but no tokens were returned by the SDK.");
  }

  stdout.write(`${JSON.stringify(tokens)}\n`);
  stderr.write(
    "\nCopy the JSON line above (single line) and run:\n" +
      "  npx convex env set GARMIN_TOKENS_JSON '<paste output here>'\n",
  );
}

main().catch((error) => {
  stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
