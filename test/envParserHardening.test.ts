import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadEnvFiles } from "../src/loadEnvFiles";

function withTempDir(run: (dir: string) => void): void {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "node-safe-env-"));

  try {
    run(tempDir);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

describe("loadEnvFiles parser hardening", () => {
  it("ignores malformed lines, empty keys, and supports export syntax", () => {
    withTempDir((cwd) => {
      fs.writeFileSync(
        path.join(cwd, ".env"),
        [
          "# comment only line",
          "=should_be_ignored",
          "MALFORMED_LINE",
          "export EXPORTED=value",
          "FOO=bar # inline comment",
          'BAR="hash # preserved"',
          "__proto__=safe",
        ].join("\n"),
        "utf8",
      );

      const loaded = loadEnvFiles({ cwd, nodeEnv: "test" });

      expect(loaded.base.EXPORTED).toBe("value");
      expect(loaded.base.FOO).toBe("bar");
      expect(loaded.base.BAR).toBe("hash # preserved");
      expect(loaded.base.MALFORMED_LINE).toBeUndefined();
      expect(loaded.base[""]).toBeUndefined();
      expect(Object.getPrototypeOf(loaded.base)).toBeNull();
      expect(loaded.base.__proto__).toBe("safe");
    });
  });
});
