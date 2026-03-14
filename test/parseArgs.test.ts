import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/cli/utils/parseArgs";

describe("parseArgs", () => {
  it("parses command and flags", () => {
    const parsed = parseArgs([
      "validate",
      "--schema",
      "./env.schema.ts",
      "--strict",
      "--cwd",
      ".",
    ]);

    expect(parsed.command).toBe("validate");
    expect(parsed.flags.schema).toBe("./env.schema.ts");
    expect(parsed.flags.strict).toBe(true);
    expect(parsed.flags.cwd).toBe(".");
  });
});
