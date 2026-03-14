import { applyTransform } from "./applyTransform";
import type { EnvRule } from "./types/schema";
import { validators } from "./validators";
import type { ParseResult } from "./validators";

export function parseValue(
  key: string,
  rawValue: string,
  rule: EnvRule,
): ParseResult {
  const validator = validators[rule.type];

  const result = validator({
    key,
    rawValue,
    rule,
  });

  return applyTransform(key, rule, result);
}
