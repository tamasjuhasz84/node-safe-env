import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { runCli } from "../src/cli/index";

const fixturesDir = fileURLToPath(new URL("./fixtures/cli", import.meta.url));
const validateSchemaPath = fileURLToPath(
  new URL("./fixtures/cli/validate.schema.ts", import.meta.url),
);
const exampleSchemaPath = fileURLToPath(
  new URL("./fixtures/cli/example.schema.ts", import.meta.url),
);
const invalidSchemaPath = fileURLToPath(
  new URL("./fixtures/cli/invalid-schema.ts", import.meta.url),
);

describe("CLI integration", () => {
  it("validate succeeds with a valid schema and env setup", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");

    try {
      const exitCode = await runCli([
        "validate",
        "--schema",
        validateSchemaPath,
      ]);

      expect(exitCode).toBe(0);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("Environment validation passed"),
      );
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
      logSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("validate fails when --schema is missing", async () => {
    const logs: string[] = [];
    const errors: string[] = [];

    const exitCode = await runCli(["validate"], {
      log: (message) => logs.push(message),
      error: (message) => errors.push(message),
    });

    expect(exitCode).toBe(1);
    expect(errors.join("\n")).toContain('Missing required flag "--schema".');
    expect(logs.join("\n")).toContain("Usage:");
  });

  it("validate fails for invalid env values", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.stubEnv("ADMIN_EMAIL", "not-an-email");

    try {
      const exitCode = await runCli([
        "validate",
        "--schema",
        validateSchemaPath,
      ]);

      expect(exitCode).toBe(1);
      expect(logSpy).not.toHaveBeenCalled();

      const combinedErrors = errorSpy.mock.calls
        .map((call) => String(call[0]))
        .join("\n");

      expect(combinedErrors).toContain("Environment validation failed");
      expect(combinedErrors).toContain("ADMIN_EMAIL");
      expect(combinedErrors).toContain("valid email address");
    } finally {
      vi.unstubAllEnvs();
      logSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("validate-example succeeds for a valid example file", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const exitCode = await runCli([
        "validate-example",
        "--schema",
        exampleSchemaPath,
        "--cwd",
        fixturesDir,
        "--example-file",
        ".env.example.valid",
      ]);

      expect(exitCode).toBe(0);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(".env.example validation passed"),
      );
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("validate-example fails for missing and unknown example keys", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const exitCode = await runCli([
        "validate-example",
        "--schema",
        exampleSchemaPath,
        "--cwd",
        fixturesDir,
        "--example-file",
        ".env.example.invalid",
      ]);

      expect(exitCode).toBe(1);
      expect(logSpy).not.toHaveBeenCalled();

      const combinedErrors = errorSpy.mock.calls
        .map((call) => String(call[0]))
        .join("\n");

      expect(combinedErrors).toContain(".env.example validation failed");
      expect(combinedErrors).toContain("DATABASE_URL");
      expect(combinedErrors).toContain("EXTRA_KEY");
    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("unknown command shows failure and help behavior", async () => {
    const logs: string[] = [];
    const errors: string[] = [];

    const exitCode = await runCli(["not-a-command", "--schema", "x.ts"], {
      log: (message) => logs.push(message),
      error: (message) => errors.push(message),
    });

    expect(exitCode).toBe(1);
    expect(errors.join("\n")).toContain('Unknown command "not-a-command".');
    expect(logs.join("\n")).toContain("Usage:");
  });

  it("fails with a useful message for invalid schema module shape", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const exitCode = await runCli([
        "validate",
        "--schema",
        invalidSchemaPath,
      ]);

      expect(exitCode).toBe(1);

      const combinedErrors = errorSpy.mock.calls
        .map((call) => String(call[0]))
        .join("\n");

      expect(combinedErrors).toContain("CLI error:");
      expect(combinedErrors).toContain(
        'must export a schema as default export or named export "schema"',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
