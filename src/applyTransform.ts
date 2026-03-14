import type { EnvRule, EnvValidationIssue } from "./types/schema";
import type { ParseResult } from "./validators";

export function applyTransform(
  key: string,
  rule: EnvRule,
  result: ParseResult,
): ParseResult {
  if (result.issue || result.value === undefined || !rule.transform) {
    return result;
  }

  try {
    return {
      value: rule.transform(result.value as never),
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : `Environment variable "${key}" failed transform.`;

    return {
      issue: {
        key,
        code: "invalid_custom",
        message,
      } satisfies EnvValidationIssue,
    };
  }
}
