import { describe, expect, it } from "vitest";
import { parseValue } from "../src/parseValue";

describe("parseValue", () => {
  it("parses string values", () => {
    const result = parseValue("APP_NAME", "node-safe-env", {
      type: "string",
    });

    expect(result).toEqual({
      value: "node-safe-env",
    });
  });

  it("parses number values", () => {
    const result = parseValue("PORT", "3000", {
      type: "number",
    });

    expect(result).toEqual({
      value: 3000,
    });
  });

  it("returns invalid_number issue for bad numbers", () => {
    const result = parseValue("PORT", "abc", {
      type: "number",
    });

    expect(result.issue).toBeDefined();
    expect(result.issue?.code).toBe("invalid_number");
  });

  it("parses boolean true values", () => {
    expect(parseValue("DEBUG", "true", { type: "boolean" })).toEqual({
      value: true,
    });

    expect(parseValue("DEBUG", "1", { type: "boolean" })).toEqual({
      value: true,
    });

    expect(parseValue("DEBUG", "yes", { type: "boolean" })).toEqual({
      value: true,
    });

    expect(parseValue("DEBUG", "on", { type: "boolean" })).toEqual({
      value: true,
    });
  });

  it("parses boolean false values", () => {
    expect(parseValue("DEBUG", "false", { type: "boolean" })).toEqual({
      value: false,
    });

    expect(parseValue("DEBUG", "0", { type: "boolean" })).toEqual({
      value: false,
    });

    expect(parseValue("DEBUG", "no", { type: "boolean" })).toEqual({
      value: false,
    });

    expect(parseValue("DEBUG", "off", { type: "boolean" })).toEqual({
      value: false,
    });
  });

  it("returns invalid_boolean issue for bad booleans", () => {
    const result = parseValue("DEBUG", "maybe", {
      type: "boolean",
    });

    expect(result.issue).toBeDefined();
    expect(result.issue?.code).toBe("invalid_boolean");
  });

  it("accepts valid enum values", () => {
    const result = parseValue("NODE_ENV", "development", {
      type: "enum",
      values: ["development", "test", "production"] as const,
    });

    expect(result).toEqual({
      value: "development",
    });
  });

  it("returns invalid_enum issue for bad enum values", () => {
    const result = parseValue("NODE_ENV", "staging", {
      type: "enum",
      values: ["development", "test", "production"] as const,
    });

    expect(result.issue).toBeDefined();
    expect(result.issue?.code).toBe("invalid_enum");
  });
});
