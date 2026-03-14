import { describe, expect, it } from "vitest";
import { parseValue } from "../src/parseValue";

describe("int parser", () => {
  it("parses integer values", () => {
    const result = parseValue("RETRY_COUNT", "3", { type: "int" });

    expect(result).toEqual({ value: 3 });
  });

  it("rejects floating point values", () => {
    const result = parseValue("RETRY_COUNT", "3.14", { type: "int" });

    expect(result.issue).toEqual({
      key: "RETRY_COUNT",
      code: "invalid_number",
      message: `Environment variable "RETRY_COUNT" must be a valid integer.`,
    });
  });

  it("rejects non-numeric values", () => {
    const result = parseValue("RETRY_COUNT", "abc", { type: "int" });

    expect(result.issue).toEqual({
      key: "RETRY_COUNT",
      code: "invalid_number",
      message: `Environment variable "RETRY_COUNT" must be a valid integer.`,
    });
  });
});
