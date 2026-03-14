import type { EnvValidator } from "./types";

export const validateString: EnvValidator = (_key, rawValue) => {
  return { value: rawValue };
};
