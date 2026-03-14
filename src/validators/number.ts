import type { EnvValidator } from "./types";

export const validateNumber: EnvValidator = (key, rawValue) => {
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return {
      issue: {
        key,
        code: "invalid_number",
        message: `Environment variable "${key}" must be a valid number.`,
      },
    };
  }

  return { value: parsed };
};
