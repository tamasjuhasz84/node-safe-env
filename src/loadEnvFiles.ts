import fs from "node:fs";
import path from "node:path";
import type {
  LoadEnvFilesOptions,
  EnvSource,
  LoadedEnvFiles,
} from "./types/schema";

const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function stripInlineComment(input: string): string {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let isEscaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (
      char === "#" &&
      !inSingleQuote &&
      !inDoubleQuote &&
      (index === 0 || /\s/.test(input[index - 1] ?? ""))
    ) {
      return input.slice(0, index).trimEnd();
    }
  }

  return input.trimEnd();
}

function parseEnvFile(filePath: string): EnvSource {
  if (!fs.existsSync(filePath)) {
    return Object.create(null) as EnvSource;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const result = Object.create(null) as EnvSource;

  for (const rawLine of content.split(/\r?\n/)) {
    let line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("export ")) {
      line = line.slice("export ".length).trim();

      if (!line) {
        continue;
      }
    }

    const equalIndex = line.indexOf("=");

    if (equalIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalIndex).trim();

    if (!ENV_KEY_PATTERN.test(key)) {
      continue;
    }

    let value = stripInlineComment(line.slice(equalIndex + 1)).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

export function loadEnvFiles(
  options: LoadEnvFilesOptions = {},
): LoadedEnvFiles {
  const cwd = options.cwd ?? process.cwd();
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";

  const base = parseEnvFile(path.join(cwd, ".env"));
  const local = parseEnvFile(path.join(cwd, ".env.local"));
  const environment = parseEnvFile(path.join(cwd, `.env.${nodeEnv}`));
  const custom = options.envFile
    ? parseEnvFile(path.resolve(cwd, options.envFile))
    : (Object.create(null) as EnvSource);

  return {
    base,
    local,
    environment,
    custom,
  };
}
