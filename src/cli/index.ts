#!/usr/bin/env node

import { parseArgs } from "./utils/parseArgs";
import { runValidateCommand } from "./commands/validate";
import { runValidateExampleCommand } from "./commands/validateExample";

type CliIO = {
  log: (message: string) => void;
  error: (message: string) => void;
};

function printHelp(io: CliIO): void {
  io.log(`node-safe-env CLI

Usage:
  node-safe-env validate --schema <path> [--cwd <path>] [--env-file <path>] [--node-env <value>] [--strict]
  node-safe-env validate-example --schema <path> [--cwd <path>] [--example-file <path>]

Commands:
  validate           Validate environment variables using a schema
  validate-example   Validate a .env.example file against a schema

Options:
  --schema <path>        Path to schema module (.js, .mjs, .cjs, .ts, .mts, .cts)
  --cwd <path>           Working directory for env file loading
  --env-file <path>      Custom env file path for validate
  --node-env <value>     NODE_ENV override for validate
  --strict               Enable strict mode for unknown keys
  --example-file <path>  Custom example file path for validate-example
  --help                 Show this help

Schema module exports:
  - default export
  - named export: schema

Examples:
  node-safe-env validate --schema ./env.schema.ts
  node-safe-env validate-example --schema ./env.schema.ts
  node-safe-env validate --schema ./dist/env.schema.js --strict
`);
}

function getStringFlag(
  flags: Record<string, string | boolean>,
  name: string,
): string | undefined {
  const value = flags[name];
  return typeof value === "string" ? value : undefined;
}

export async function runCli(
  argv: string[],
  io: CliIO = {
    log: console.log,
    error: console.error,
  },
): Promise<number> {
  const parsed = parseArgs(argv);

  if (
    !parsed.command ||
    parsed.flags.help ||
    parsed.command === "help" ||
    parsed.command === "--help"
  ) {
    printHelp(io);
    return 0;
  }

  const schemaPath = getStringFlag(parsed.flags, "schema");

  if (!schemaPath) {
    io.error('Missing required flag "--schema".\n');
    printHelp(io);
    return 1;
  }

  if (parsed.command === "validate") {
    return runValidateCommand({
      schemaPath,
      cwd: getStringFlag(parsed.flags, "cwd"),
      envFile: getStringFlag(parsed.flags, "env-file"),
      nodeEnv: getStringFlag(parsed.flags, "node-env"),
      strict: parsed.flags.strict === true,
    });
  }

  if (parsed.command === "validate-example") {
    return runValidateExampleCommand({
      schemaPath,
      cwd: getStringFlag(parsed.flags, "cwd"),
      exampleFile: getStringFlag(parsed.flags, "example-file"),
    });
  }

  io.error(`Unknown command "${parsed.command}".\n`);
  printHelp(io);
  return 1;
}

async function main(): Promise<void> {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}

void main();
