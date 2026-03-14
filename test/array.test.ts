import { describe, expect, it } from "vitest";
import { parseValue } from "../src/parseValue";

describe("array parser", () => {
  it("uses default behavior: comma separator, trimmed items, and no empty items", () => {
    const result = parseValue("ALLOWED_HOSTS", "a, b, c", { type: "array" });

    expect(result).toEqual({ value: ["a", "b", "c"] });
  });

  it("supports trimItems: false", () => {
    const result = parseValue("ALLOWED_HOSTS", "a, b , c", {
      type: "array",
      trimItems: false,
    });

    expect(result).toEqual({ value: ["a", " b ", " c"] });
  });

  it("rejects empty items by default", () => {
    const result = parseValue("ALLOWED_HOSTS", "a,,b", { type: "array" });

    expect(result).toEqual({
      issue: {
        key: "ALLOWED_HOSTS",
        code: "invalid_array",
        message:
          'Environment variable "ALLOWED_HOSTS" cannot contain empty array items',
      },
    });
  });

  it("supports allowEmptyItems: true", () => {
    const result = parseValue("ALLOWED_HOSTS", "a,,b", {
      type: "array",
      allowEmptyItems: true,
    });

    expect(result).toEqual({ value: ["a", "", "b"] });
  });

  it("supports custom separator while keeping default trim behavior", () => {
    const result = parseValue("ALLOWED_HOSTS", "a| b |c", {
      type: "array",
      separator: "|",
    });

    expect(result).toEqual({ value: ["a", "b", "c"] });
  });
});
