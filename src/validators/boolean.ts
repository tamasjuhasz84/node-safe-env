import type { EnvValidator } from "./types";

const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "off"]);

export const validateBoolean: EnvValidator = ({ key, rawValue }) => {
  const normalized = rawValue.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return { value: true };
  }

  if (FALSE_VALUES.has(normalized)) {
    return { value: false };
  }

  return {
    issue: {
      key,
      code: "invalid_boolean",
      message: `Environment variable "${key}" must be a valid boolean.`,
    },
  };
};
