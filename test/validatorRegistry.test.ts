import { describe, it, expect } from "vitest";
import { validatorRegistry } from "../src/validators/registry";

describe("validatorRegistry", () => {
  it("contains all built-in validators", () => {
    expect(validatorRegistry.string).toBeTypeOf("function");
    expect(validatorRegistry.number).toBeTypeOf("function");
    expect(validatorRegistry.boolean).toBeTypeOf("function");
    expect(validatorRegistry.enum).toBeTypeOf("function");
    expect(validatorRegistry.url).toBeTypeOf("function");
    expect(validatorRegistry.port).toBeTypeOf("function");
    expect(validatorRegistry.json).toBeTypeOf("function");
  });
});
