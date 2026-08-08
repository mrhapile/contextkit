#!/usr/bin/env node

import { runCli } from "../packages/installer/src/cli.js";

runCli(process.argv.slice(2)).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
