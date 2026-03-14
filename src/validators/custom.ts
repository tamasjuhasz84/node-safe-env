import type { CustomRule } from "../types/schema";
import type { EnvValidator } from "./types";

export const validateCustom: EnvValidator = ({ key, rawValue, rule }) => {
  const customRule = rule as CustomRule;

  try {
    const parsed = customRule.parse(rawValue);

    return { value: parsed };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : `Environment variable "${key}" failed custom validation.`;

    return {
      issue: {
        key,
        code: "invalid_custom",
        message,
      },
    };
  }
};
