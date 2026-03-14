import type { EnvRule, EnvValidationIssue } from "./types/schema";
import { validators } from "./validators";

export function parseValue(
  key: string,
  rawValue: string,
  rule: EnvRule,
): { value?: unknown; issue?: EnvValidationIssue } {
  const validator = validators[rule.type];

  if (!validator) {
    return {
      issue: {
        key,
        code: "invalid_json",
        message: `Unsupported validator type: "${rule.type}".`,
      },
    };
  }

  return validator(key, rawValue, rule);
}
