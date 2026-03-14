import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { loadEnvFiles } from "../src/loadEnvFiles";
import { mergeSources } from "../src/mergeSources";

describe("merge precedence", () => {
  it("lets runtime env override file values", () => {
    const cwd = fileURLToPath(new URL("./fixtures", import.meta.url));

    const files = loadEnvFiles({
      cwd,
      nodeEnv: "production",
    });

    const merged = mergeSources(files, {
      PORT: "7000",
    });

    expect(merged.PORT).toBe("7000");
    expect(merged.DEBUG).toBe("false");
  });
});
