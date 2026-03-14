import { EnvValidationError } from "./errors/EnvValidationError";
import { findUnknownEnvKeys } from "./findUnknownEnvKeys";
import { flattenSchema } from "./flattenSchema";
import { loadEnvFiles } from "./loadEnvFiles";
import { mergeSources } from "./mergeSources";
import { parseValue } from "./parseValue";
import { setNestedValue } from "./setNestedValue";
import type {
  CreateEnvOptions,
  EnvSchema,
  EnvValidationIssue,
  ParsedEnv,
} from "./types/schema";

function isEmptyString(value: string): boolean {
  return value.trim() === "";
}

function defaultToRawValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return JSON.stringify(value);
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
  const result: Record<string, unknown> = {};
  const flattenedSchema = flattenSchema(schema as Record<string, unknown>);

  if (options.strict) {
    issues.push(
      ...findUnknownEnvKeys(schema as Record<string, unknown>, source),
    );
  }

  for (const entry of flattenedSchema) {
    const { path, envKey, rule } = entry;
    const currentValue = source[envKey];

    if (typeof currentValue !== "string") {
      if (rule.default !== undefined) {
        const parsedDefault = parseValue(
          envKey,
          defaultToRawValue(rule.default),
          rule,
        );

        if (parsedDefault.issue) {
          issues.push(parsedDefault.issue);
          continue;
        }

        setNestedValue(result, path, parsedDefault.value);
        continue;
      }

      if (rule.required) {
        issues.push({
          key: envKey,
          code: "missing",
          message: `Missing required environment variable "${envKey}".`,
        });
      }

      continue;
    }

    const rawValue = currentValue;

    if (!rule.allowEmpty && isEmptyString(rawValue)) {
      if (rule.default !== undefined) {
        const parsedDefault = parseValue(
          envKey,
          defaultToRawValue(rule.default),
          rule,
        );

        if (parsedDefault.issue) {
          issues.push(parsedDefault.issue);
          continue;
        }

        setNestedValue(result, path, parsedDefault.value);
        continue;
      }

      issues.push({
        key: envKey,
        code: "empty",
        message: `Environment variable "${envKey}" cannot be empty.`,
      });
      continue;
    }

    const parsed = parseValue(envKey, rawValue, rule);

    if (parsed.issue) {
      issues.push(parsed.issue);
      continue;
    }

    setNestedValue(result, path, parsed.value);
  }

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }

  return result as unknown as ParsedEnv<S>;
}
