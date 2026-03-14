import type { EnvValidator } from "./types";

export const validateUrl: EnvValidator = ({ key, rawValue }) => {
  try {
    new URL(rawValue);

    return { value: rawValue };
  } catch {
    return {
      issue: {
        key,
        code: "invalid_url",
        message: `Environment variable "${key}" must be a valid URL.`,
      },
    };
  }
};
