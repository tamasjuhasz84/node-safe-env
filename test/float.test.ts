import { describe, expect, it } from "vitest";
import { parseValue } from "../src/parseValue";

describe("float parser", () => {
  it("parses floating point values", () => {
    const result = parseValue("THRESHOLD", "3.14", { type: "float" });

    expect(result).toEqual({ value: 3.14 });
  });

  it("parses integer-like values as float numbers", () => {
    const result = parseValue("THRESHOLD", "3", { type: "float" });

    expect(result).toEqual({ value: 3 });
  });

  it("rejects non-numeric values", () => {
    const result = parseValue("THRESHOLD", "abc", { type: "float" });

    expect(result.issue).toEqual({
      key: "THRESHOLD",
      code: "invalid_number",
      message: `Environment variable "THRESHOLD" must be a valid float.`,
    });
  });
});
