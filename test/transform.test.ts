import { describe, expect, it } from "vitest";
import { parseValue } from "../src/parseValue";

describe("transform", () => {
  it("applies transform after successful parsing", () => {
    const result = parseValue("APP_NAME", " hello ", {
      type: "string",
      transform: (value) => value.trim(),
    });

    expect(result).toEqual({ value: "hello" });
  });

  it("applies transform to parsed number values", () => {
    const result = parseValue("TIMEOUT", "5", {
      type: "number",
      transform: (value) => value * 1000,
    });

    expect(result).toEqual({ value: 5000 });
  });

  it("does not run transform if parsing already failed", () => {
    const result = parseValue("TIMEOUT", "abc", {
      type: "number",
      transform: () => 999,
    });

    expect(result.issue).toEqual({
      key: "TIMEOUT",
      code: "invalid_number",
      message: `Environment variable "TIMEOUT" must be a valid number.`,
    });
  });

  it("returns invalid_custom when transform throws", () => {
    const result = parseValue("APP_NAME", "hello", {
      type: "string",
      transform: () => {
        throw new Error(`Environment variable "APP_NAME" transform failed.`);
      },
    });

    expect(result.issue).toEqual({
      key: "APP_NAME",
      code: "invalid_custom",
      message: `Environment variable "APP_NAME" transform failed.`,
    });
  });

  it("returns a fallback message when transform throws a non-Error", () => {
    const result = parseValue("APP_NAME", "hello", {
      type: "string",
      transform: () => {
        throw "bad";
      },
    });

    expect(result.issue).toEqual({
      key: "APP_NAME",
      code: "invalid_custom",
      message: `Environment variable "APP_NAME" failed transform.`,
    });
  });
});
