import type { EnvValidator } from "./types";

export const validateString: EnvValidator = ({ rawValue }) => {
  return { value: rawValue };
};
