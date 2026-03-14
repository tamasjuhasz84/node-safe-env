import { describe, expect, it } from "vitest";
import { parseValue } from "../src/parseValue";

describe("custom parser", () => {
  it("parses values using a custom parser", () => {
    const result = parseValue("APP_PREFIX", "app-prod", {
      type: "custom",
      parse: (value) => value.toUpperCase(),
    });

    expect(result).toEqual({ value: "APP-PROD" });
  });

  it("returns an invalid_custom issue when custom parsing fails", () => {
    const result = parseValue("APP_PREFIX", "prod", {
      type: "custom",
      parse: (value) => {
        if (!value.startsWith("app-")) {
          throw new Error(
            `Environment variable "APP_PREFIX" must start with "app-".`,
          );
        }

        return value;
      },
    });

    expect(result.issue).toEqual({
      key: "APP_PREFIX",
      code: "invalid_custom",
      message: `Environment variable "APP_PREFIX" must start with "app-".`,
    });
  });

  it("returns a fallback message when a non-Error value is thrown", () => {
    const result = parseValue("APP_PREFIX", "prod", {
      type: "custom",
      parse: () => {
        throw "bad";
      },
    });

    expect(result.issue).toEqual({
      key: "APP_PREFIX",
      code: "invalid_custom",
      message: `Environment variable "APP_PREFIX" failed custom validation.`,
    });
  });
});
