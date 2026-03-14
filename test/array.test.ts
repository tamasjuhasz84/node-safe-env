import { describe, expect, it } from "vitest";
import { parseValue } from "../src/parseValue";

describe("array parser", () => {
  it("parses comma-separated values into a string array", () => {
    const result = parseValue("ALLOWED_HOSTS", "a,b,c", { type: "array" });

    expect(result).toEqual({ value: ["a", "b", "c"] });
  });

  it("trims whitespace around items", () => {
    const result = parseValue("ALLOWED_HOSTS", "a, b,  c", { type: "array" });

    expect(result).toEqual({ value: ["a", "b", "c"] });
  });

  it("supports a custom separator", () => {
    const result = parseValue("ALLOWED_HOSTS", "a|b|c", {
      type: "array",
      separator: "|",
    });

    expect(result).toEqual({ value: ["a", "b", "c"] });
  });

  it("preserves empty items", () => {
    const result = parseValue("ALLOWED_HOSTS", "a,,c", { type: "array" });

    expect(result).toEqual({ value: ["a", "", "c"] });
  });
});
