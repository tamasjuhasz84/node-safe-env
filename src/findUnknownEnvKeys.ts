import { flattenSchema } from "./flattenSchema";
import type { EnvSource, EnvValidationIssue } from "./types/schema";

export function findUnknownEnvKeys(
  schema: Record<string, unknown>,
  source: EnvSource,
): EnvValidationIssue[] {
  const knownKeys = new Set(flattenSchema(schema).map((entry) => entry.envKey));
  const issues: EnvValidationIssue[] = [];

  for (const key of Object.keys(source)) {
    if (source[key] === undefined) {
      continue;
    }

    if (knownKeys.has(key)) {
      continue;
    }

    issues.push({
      key,
      code: "unknown_key",
      message: `Environment variable "${key}" is not defined in the schema.`,
    });
  }

  return issues;
}
