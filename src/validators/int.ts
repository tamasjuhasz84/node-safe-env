import type { EnvValidator } from "./types";

export const validateInt: EnvValidator = ({ key, rawValue }) => {
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed)) {
    return {
      issue: {
        key,
        code: "invalid_number",
        message: `Environment variable "${key}" must be a valid integer.`,
      },
    };
  }

  return { value: parsed };
};
