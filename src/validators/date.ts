import type { DateRule, EnvValidationIssue } from "../types/schema";
import type { EnvValidator } from "./types";

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export const validateDate: EnvValidator = ({ key, rawValue, rule }) => {
  const dateRule = rule as DateRule;
  void dateRule;

  const value = rawValue.trim();

  if (!value) {
    const issue: EnvValidationIssue = {
      key,
      code: "invalid_date",
      message: `Environment variable "${key}" must be a valid ISO date`,
    };

    return { issue };
  }

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isoDateTimeRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

  if (!isoDateRegex.test(value) && !isoDateTimeRegex.test(value)) {
    const issue: EnvValidationIssue = {
      key,
      code: "invalid_date",
      message: `Environment variable "${key}" must be a valid ISO date string`,
    };

    return { issue };
  }

  const parsed = new Date(value);

  if (!isValidDate(parsed)) {
    const issue: EnvValidationIssue = {
      key,
      code: "invalid_date",
      message: `Environment variable "${key}" must be a valid date`,
    };

    return { issue };
  }

  if (isoDateRegex.test(value)) {
    const [year, month, day] = value.split("-").map(Number);

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() + 1 !== month ||
      parsed.getUTCDate() !== day
    ) {
      const issue: EnvValidationIssue = {
        key,
        code: "invalid_date",
        message: `Environment variable "${key}" must be a real calendar date`,
      };

      return { issue };
    }
  }

  return {
    value: parsed,
  };
};
