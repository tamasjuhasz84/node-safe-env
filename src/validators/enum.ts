import type { EnumRule } from "../types/schema";
import type { EnvValidator } from "./types";

export const validateEnum: EnvValidator = (key, rawValue, rule) => {
  const enumRule = rule as EnumRule;

  if (!enumRule.values.includes(rawValue)) {
    return {
      issue: {
        key,
        code: "invalid_enum",
        message: `Environment variable "${key}" must be one of: ${enumRule.values.join(", ")}.`,
      },
    };
  }

  return { value: rawValue };
};
