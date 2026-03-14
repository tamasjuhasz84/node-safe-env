#!/usr/bin/env node

import { parseArgs } from "./utils/parseArgs";
import { runValidateCommand } from "./commands/validate";
import { runValidateExampleCommand } from "./commands/validateExample";

function printHelp(): void {
  console.log(`node-safe-env CLI

Usage:
  node-safe-env validate --schema <path> [--cwd <path>] [--env-file <path>] [--node-env <value>] [--strict]
  node-safe-env validate-example --schema <path> [--cwd <path>] [--example-file <path>]

Commands:
  validate           Validate environment variables using a schema
  validate-example   Validate a .env.example file against a schema

Options:
  --schema <path>        Path to schema module
  --cwd <path>           Working directory for env file loading
  --env-file <path>      Custom env file path for validate
  --node-env <value>     NODE_ENV override for validate
  --strict               Enable strict mode for unknown keys
  --example-file <path>  Custom example file path for validate-example
  --help                 Show this help
`);
}

function getStringFlag(
  flags: Record<string, string | boolean>,
  name: string,
): string | undefined {
  const value = flags[name];
  return typeof value === "string" ? value : undefined;
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed.command || parsed.flags.help || parsed.command === "help") {
    printHelp();
    process.exitCode = 0;
    return;
  }

  const schemaPath = getStringFlag(parsed.flags, "schema");

  if (!schemaPath) {
    console.error('Missing required flag "--schema".\n');
    printHelp();
    process.exitCode = 1;
    return;
  }

  if (parsed.command === "validate") {
    const exitCode = await runValidateCommand({
      schemaPath,
      cwd: getStringFlag(parsed.flags, "cwd"),
      envFile: getStringFlag(parsed.flags, "env-file"),
      nodeEnv: getStringFlag(parsed.flags, "node-env"),
      strict: parsed.flags.strict === true,
    });

    process.exitCode = exitCode;
    return;
  }

  if (parsed.command === "validate-example") {
    const exitCode = await runValidateExampleCommand({
      schemaPath,
      cwd: getStringFlag(parsed.flags, "cwd"),
      exampleFile: getStringFlag(parsed.flags, "example-file"),
    });

    process.exitCode = exitCode;
    return;
  }

  console.error(`Unknown command "${parsed.command}".\n`);
  printHelp();
  process.exitCode = 1;
}

void main();
