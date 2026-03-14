import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readEnvFileSource } from "../src/readEnvFileSource";

describe("readEnvFileSource", () => {
  it("reads key-value pairs from an env file", () => {
    const dir = mkdtempSync(join(tmpdir(), "node-safe-env-"));
    const filePath = join(dir, ".env.example");

    writeFileSync(
      filePath,
      ["PORT=3000", "API_KEY=secret", "EMPTY=", "# comment"].join("\n"),
      "utf8",
    );

    expect(readEnvFileSource(filePath)).toEqual({
      PORT: "3000",
      API_KEY: "secret",
      EMPTY: "",
    });

    rmSync(dir, { recursive: true, force: true });
  });

  it("returns an empty object when the file does not exist", () => {
    expect(readEnvFileSource("definitely-missing-file.env")).toEqual({});
  });

  it("strips matching surrounding quotes", () => {
    const dir = mkdtempSync(join(tmpdir(), "node-safe-env-"));
    const filePath = join(dir, ".env.example");

    writeFileSync(
      filePath,
      ['NAME="hello"', "TOKEN='abc123'"].join("\n"),
      "utf8",
    );

    expect(readEnvFileSource(filePath)).toEqual({
      NAME: "hello",
      TOKEN: "abc123",
    });

    rmSync(dir, { recursive: true, force: true });
  });
});
