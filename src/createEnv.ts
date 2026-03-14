import { EnvValidationError } from "./errors/EnvValidationError";
import { findUnknownEnvKeys } from "./findUnknownEnvKeys";
import { loadEnvFiles } from "./loadEnvFiles";
import { mergeSources } from "./mergeSources";
import { parseValue } from "./parseValue";
import type {
  CreateEnvOptions,
  EnvSchema,
  EnvValidationIssue,
  ParsedEnv,
} from "./types/schema";

function isEmptyString(value: string): boolean {
  return value.trim() === "";
}

export function createEnv<S extends EnvSchema>(
  schema: S,
  options: CreateEnvOptions = {},
): ParsedEnv<S> {
  const source =
    options.source ??
    mergeSources(
      loadEnvFiles({
        cwd: options.cwd,
        nodeEnv: options.nodeEnv,
        envFile: options.envFile,
      }),
      process.env,
    );

  const issues: EnvValidationIssue[] = [];
  const result: Partial<Record<keyof S, unknown>> = {};

  if (options.strict) {
    issues.push(...findUnknownEnvKeys(schema, source));
  }

  for (const key of Object.keys(schema) as Array<keyof S>) {
    const rule = schema[key];
    const currentValue = source[String(key)];

    if (typeof currentValue !== "string") {
      if (rule.default !== undefined) {
        result[key] = rule.default;
        continue;
      }

      if (rule.required) {
        issues.push({
          key: String(key),
          code: "missing",
          message: `Missing required environment variable "${String(key)}".`,
        });
      }

      continue;
    }

    const rawValue: string = currentValue;

    if (!rule.allowEmpty && isEmptyString(rawValue)) {
      if (rule.default !== undefined) {
        result[key] = rule.default;
        continue;
      }

      issues.push({
        key: String(key),
        code: "empty",
        message: `Environment variable "${String(key)}" cannot be empty.`,
      });
      continue;
    }

    const parsed = parseValue(String(key), rawValue, rule);

    if (parsed.issue) {
      issues.push(parsed.issue);
      continue;
    }

    result[key] = parsed.value;
  }

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }

  return result as unknown as ParsedEnv<S>;
}
