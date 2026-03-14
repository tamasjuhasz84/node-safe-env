import type { EmailRule, EnvValidationIssue } from "../types/schema";
import type { EnvValidator } from "./types";

export const validateEmail: EnvValidator = ({ key, rawValue, rule }) => {
  const emailRule = rule as EmailRule;
  void emailRule;

  const value = rawValue.trim();

  if (!value) {
    const issue: EnvValidationIssue = {
      key,
      code: "invalid_email",
      message: `Environment variable "${key}" must be a valid email address`,
    };

    return { issue };
  }

  if (/\s/.test(value)) {
    const issue: EnvValidationIssue = {
      key,
      code: "invalid_email",
      message: `Environment variable "${key}" must be a valid email address`,
    };

    return { issue };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    const issue: EnvValidationIssue = {
      key,
      code: "invalid_email",
      message: `Environment variable "${key}" must be a valid email address`,
    };

    return { issue };
  }

  return {
    value,
  };
};