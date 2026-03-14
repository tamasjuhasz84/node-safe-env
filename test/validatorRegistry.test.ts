import { describe, expect, it } from "vitest";
import { validators } from "../src/validators";

describe("validators registry", () => {
  it("contains all built-in validators", () => {
    expect(validators.string).toBeTypeOf("function");
    expect(validators.number).toBeTypeOf("function");
    expect(validators.boolean).toBeTypeOf("function");
    expect(validators.enum).toBeTypeOf("function");
    expect(validators.url).toBeTypeOf("function");
    expect(validators.port).toBeTypeOf("function");
    expect(validators.json).toBeTypeOf("function");
  });
});
