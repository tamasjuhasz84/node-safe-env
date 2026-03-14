import type { EnvValidator } from "./types";

export const validateJson: EnvValidator = ({ key, rawValue }) => {
  try {
    const parsed = JSON.parse(rawValue);

    return { value: parsed };
  } catch {
    return {
      issue: {
        key,
        code: "invalid_json",
        message: `Environment variable "${key}" must contain valid JSON.`,
      },
    };
  }
};
