import type { ArrayRule, EnvValidationIssue } from "../types/schema";
import type { EnvValidator } from "./types";

export const validateArray: EnvValidator = ({ key, rawValue, rule }) => {
  const arrayRule = rule as ArrayRule;
  const separator = arrayRule.separator ?? ",";
  const trimItems = arrayRule.trimItems ?? true;
  const allowEmptyItems = arrayRule.allowEmptyItems ?? false;
  const splitValues = rawValue.split(separator);

  const parsed = trimItems
    ? splitValues.map((item) => item.trim())
    : splitValues;

  if (!allowEmptyItems && parsed.some((item) => item === "")) {
    const issue: EnvValidationIssue = {
      key,
      code: "invalid_array",
      message: `Environment variable "${key}" cannot contain empty array items`,
    };

    return { issue };
  }

  return { value: parsed };
};
