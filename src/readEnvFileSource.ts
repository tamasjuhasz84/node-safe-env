import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { EnvSource } from "./types/schema";

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function readEnvFileSource(filePath: string): EnvSource {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, "utf8");
  const source: EnvSource = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();

    if (!key) {
      continue;
    }

    source[key] = stripQuotes(rawValue);
  }

  return source;
}

export function resolveExampleEnvPath(
  cwd: string = process.cwd(),
  exampleFile: string = ".env.example",
): string {
  return resolve(cwd, exampleFile);
}
