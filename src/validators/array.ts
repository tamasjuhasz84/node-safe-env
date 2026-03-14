import type { ArrayRule } from "../types/schema";
import type { EnvValidator } from "./types";

export const validateArray: EnvValidator = ({ rawValue, rule }) => {
  const arrayRule = rule as ArrayRule;
  const separator = arrayRule.separator ?? ",";

  const parsed = rawValue.split(separator).map((item) => item.trim());

  return { value: parsed };
};
