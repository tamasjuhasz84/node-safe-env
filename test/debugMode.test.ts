import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createEnv } from "../src/createEnv";
import { EnvValidationError } from "../src/errors/EnvValidationError";
import type { EnvDebugReport } from "../src/types/schema";

describe("createEnv debug mode", () => {
  it("emits one debug report through console.info when debug is true", () => {
    const cwd = fileURLToPath(new URL("./fixtures", import.meta.url));
    const infoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);

    createEnv(
      {
        PORT: { type: "number", required: true },
      },
      {
        cwd,
        nodeEnv: "production",
        debug: true,
      },
    );

    expect(infoSpy).toHaveBeenCalledTimes(1);

    const report = infoSpy.mock.calls[0]?.[0] as EnvDebugReport;
    expect(report.loadedFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: ".env" }),
        expect.objectContaining({ source: ".env.local" }),
        expect.objectContaining({ source: ".env.environment" }),
        expect.objectContaining({ source: "custom" }),
      ]),
    );
    expect(report.keys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "PORT",
          ruleType: "number",
          status: "parsed",
        }),
      ]),
    );

    infoSpy.mockRestore();
  });

  it("shows source precedence in debug output", () => {
    const cwd = fileURLToPath(new URL("./fixtures", import.meta.url));
    const logger = vi.fn();

    vi.stubEnv("PORT", "7100");

    try {
      const env = createEnv(
        {
          PORT: { type: "number", required: true },
        },
        {
          cwd,
          nodeEnv: "production",
          debug: { logger },
        },
      );

      expect(env.PORT).toBe(7100);

      const report = logger.mock.calls[0]?.[0] as EnvDebugReport;
      const portEntry = report.keys.find((entry) => entry.key === "PORT");

      expect(portEntry).toBeDefined();
      expect(portEntry?.source).toBe("process.env");
      expect(portEntry?.raw).toBe("7100");
      expect(portEntry?.parsed).toBe(7100);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("reports default usage and function default kind", () => {
    const logger = vi.fn();

    const env = createEnv(
      {
        API_KEY: {
          type: "string",
          default: () => "generated-token",
        },
      },
      {
        source: {},
        debug: { logger },
      },
    );

    expect(env.API_KEY).toBe("generated-token");

    const report = logger.mock.calls[0]?.[0] as EnvDebugReport;
    const apiKeyEntry = report.keys.find((entry) => entry.key === "API_KEY");

    expect(apiKeyEntry).toBeDefined();
    expect(apiKeyEntry?.status).toBe("defaulted");
    expect(apiKeyEntry?.source).toBe("default");
    expect(apiKeyEntry?.usedDefault).toBe(true);
    expect(apiKeyEntry?.defaultKind).toBe("function");
    expect(apiKeyEntry?.raw).toBe("generated-token");
    expect(apiKeyEntry?.parsed).toBe("generated-token");
  });

  it("reports issue path in debug output", () => {
    const logger = vi.fn();

    expect(() =>
      createEnv(
        {
          ADMIN_EMAIL: {
            type: "email",
            required: true,
          },
        },
        {
          source: {
            ADMIN_EMAIL: "not-an-email",
          },
          debug: { logger },
        },
      ),
    ).toThrowError(EnvValidationError);

    const report = logger.mock.calls[0]?.[0] as EnvDebugReport;
    const emailEntry = report.keys.find((entry) => entry.key === "ADMIN_EMAIL");

    expect(emailEntry).toBeDefined();
    expect(emailEntry?.status).toBe("issue");
    expect(emailEntry?.issue?.code).toBe("invalid_email");
    expect(emailEntry?.source).toBe("process.env");
  });

  it("masks sensitive raw and parsed debug values", () => {
    const logger = vi.fn();

    createEnv(
      {
        TOKEN: {
          type: "string",
          sensitive: true,
          required: true,
        },
      },
      {
        source: {
          TOKEN: "secret-token",
        },
        debug: { logger },
      },
    );

    const report = logger.mock.calls[0]?.[0] as EnvDebugReport;
    const tokenEntry = report.keys.find((entry) => entry.key === "TOKEN");

    expect(tokenEntry).toBeDefined();
    expect(tokenEntry?.raw).toBe("***");
    expect(tokenEntry?.parsed).toBe("***");
  });

  it("emits debug report before throwing EnvValidationError", () => {
    const logger = vi.fn();

    expect(() =>
      createEnv(
        {
          REQUIRED_KEY: {
            type: "string",
            required: true,
          },
        },
        {
          source: {},
          debug: { logger },
        },
      ),
    ).toThrowError(EnvValidationError);

    expect(logger).toHaveBeenCalledTimes(1);
    const report = logger.mock.calls[0]?.[0] as EnvDebugReport;
    const requiredEntry = report.keys.find(
      (entry) => entry.key === "REQUIRED_KEY",
    );

    expect(requiredEntry).toBeDefined();
    expect(requiredEntry?.status).toBe("missing");
    expect(requiredEntry?.issue?.code).toBe("missing");
  });
});
