import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateExampleEnvFile } from "../src/validateExampleEnvFile";

describe("validateExampleEnvFile", () => {
  it("validates a matching .env.example file", () => {
    const dir = mkdtempSync(join(tmpdir(), "node-safe-env-"));
    const filePath = join(dir, ".env.example");

    writeFileSync(
      filePath,
      ["SERVER_PORT=", "DATABASE_URL="].join("\n"),
      "utf8",
    );

    const schema = {
      server: {
        port: { type: "port", required: true },
      },
      database: {
        url: { type: "string", required: true },
      },
    } as const;

    expect(
      validateExampleEnvFile(schema, {
        cwd: dir,
      }),
    ).toEqual([]);

    rmSync(dir, { recursive: true, force: true });
  });

  it("returns missing and unknown issues from .env.example", () => {
    const dir = mkdtempSync(join(tmpdir(), "node-safe-env-"));
    const filePath = join(dir, ".env.example");

    writeFileSync(
      filePath,
      ["SERVER_PORT=", "EXTRA_KEY=value"].join("\n"),
      "utf8",
    );

    const schema = {
      server: {
        port: { type: "port", required: true },
      },
      database: {
        url: { type: "string", required: true },
      },
    } as const;

    expect(
      validateExampleEnvFile(schema, {
        cwd: dir,
      }),
    ).toEqual([
      {
        key: "DATABASE_URL",
        code: "missing_example_key",
        message: `Environment variable "DATABASE_URL" is missing from .env.example.`,
      },
      {
        key: "EXTRA_KEY",
        code: "unknown_example_key",
        message: `Environment variable "EXTRA_KEY" in .env.example is not defined in the schema.`,
      },
    ]);

    rmSync(dir, { recursive: true, force: true });
  });

  it("supports a custom example file name", () => {
    const dir = mkdtempSync(join(tmpdir(), "node-safe-env-"));
    const filePath = join(dir, ".env.sample");

    writeFileSync(filePath, "SERVER_PORT=\n", "utf8");

    const schema = {
      server: {
        port: { type: "port", required: true },
      },
    } as const;

    expect(
      validateExampleEnvFile(schema, {
        cwd: dir,
        exampleFile: ".env.sample",
      }),
    ).toEqual([]);

    rmSync(dir, { recursive: true, force: true });
  });
});
