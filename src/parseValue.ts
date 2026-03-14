import type { EnvRule, EnvValidationIssue } from "./types/schema";

const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "off"]);

export function parseValue(
  key: string,
  rawValue: string,
  rule: EnvRule,
): { value?: string | number | boolean; issue?: EnvValidationIssue } {
  switch (rule.type) {
    case "string":
      return { value: rawValue };

    case "number": {
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
    }

    case "boolean": {
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
    }

    case "enum": {
      if (!rule.values.includes(rawValue)) {
        return {
          issue: {
            key,
            code: "invalid_enum",
            message: `Environment variable "${key}" must be one of: ${rule.values.join(", ")}.`,
          },
        };
      }

      return { value: rawValue };
    }
  }
}
