import { flattenSchema } from "./flattenSchema";
import type { EnvSchema, EnvSource, EnvValidationIssue } from "./types/schema";

export function validateExampleEnv(
  schema: EnvSchema,
  exampleSource: EnvSource,
): EnvValidationIssue[] {
  const issues: EnvValidationIssue[] = [];
  const flattenedSchema = flattenSchema(schema);
  const expectedKeys = new Set(flattenedSchema.map((entry) => entry.envKey));

  for (const entry of flattenedSchema) {
    const { envKey } = entry;

    if (!(envKey in exampleSource)) {
      issues.push({
        key: envKey,
        code: "missing_example_key",
        message: `Environment variable "${envKey}" is missing from .env.example.`,
      });
    }
  }

  for (const key of Object.keys(exampleSource)) {
    if (exampleSource[key] === undefined) {
      continue;
    }

    if (expectedKeys.has(key)) {
      continue;
    }

    issues.push({
      key,
      code: "unknown_example_key",
      message: `Environment variable "${key}" in .env.example is not defined in the schema.`,
    });
  }

  return issues;
}
