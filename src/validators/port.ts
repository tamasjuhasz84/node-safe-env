import type { EnvValidator } from "./types";

export const validatePort: EnvValidator = (key, rawValue) => {
  const num = Number(rawValue);

  if (!Number.isInteger(num) || num < 1 || num > 65535) {
    return {
      issue: {
        key,
        code: "invalid_port",
        message: `Environment variable "${key}" must be a valid port (1–65535).`,
      },
    };
  }

  return { value: num };
};
