import { describe, expect, it, vi } from "vitest";
import { createEnv } from "../src/createEnv";
import { EnvValidationError } from "../src/errors/EnvValidationError";

describe("functional defaults", () => {
  it("uses a function default when a value is missing", () => {
    const getDefault = vi.fn(() => "admin@example.com");

    const env = createEnv(
      {
        ADMIN_EMAIL: { type: "email", default: getDefault },
      },
      {
        source: {},
      },
    );

    expect(env.ADMIN_EMAIL).toBe("admin@example.com");
    expect(getDefault).toHaveBeenCalledTimes(1);
  });

  it("uses a function default when an empty string falls back to default", () => {
    const getDefault = vi.fn(() => 3000);

    const env = createEnv(
      {
        PORT: { type: "port", default: getDefault },
      },
      {
        source: {
          PORT: "",
        },
      },
    );

    expect(env.PORT).toBe(3000);
    expect(getDefault).toHaveBeenCalledTimes(1);
  });

  it("does not execute a function default when a real env value exists", () => {
    const getDefault = vi.fn(() => 3000);

    const env = createEnv(
      {
        PORT: { type: "port", default: getDefault },
      },
      {
        source: {
          PORT: "8080",
        },
      },
    );

    expect(env.PORT).toBe(8080);
    expect(getDefault).not.toHaveBeenCalled();
  });

  it("supports function defaults for date values", () => {
    const getDefault = vi.fn(() => new Date("2025-01-01T00:00:00.000Z"));

    const env = createEnv(
      {
        START_DATE: { type: "date", default: getDefault },
      },
      {
        source: {},
      },
    );

    expect(env.START_DATE).toBeInstanceOf(Date);
    expect(env.START_DATE?.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    expect(getDefault).toHaveBeenCalledTimes(1);
  });

  it("reports invalid_email when a function default returns an invalid email (missing-value path)", () => {
    expect(() =>
      createEnv(
        {
          ADMIN_EMAIL: {
            type: "email",
            default: () => "not-an-email",
          },
        },
        {
          source: {},
        },
      ),
    ).toThrowError(EnvValidationError);

    try {
      createEnv(
        {
          ADMIN_EMAIL: {
            type: "email",
            default: () => "not-an-email",
          },
        },
        {
          source: {},
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues).toEqual([
          {
            key: "ADMIN_EMAIL",
            code: "invalid_email",
            message:
              'Environment variable "ADMIN_EMAIL" must be a valid email address',
          },
        ]);
      }
    }
  });

  it("reports invalid_email when a function default returns an invalid email (empty-string fallback path)", () => {
    try {
      createEnv(
        {
          ADMIN_EMAIL: {
            type: "email",
            default: () => "not-an-email",
          },
        },
        {
          source: { ADMIN_EMAIL: "" },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues).toEqual([
          {
            key: "ADMIN_EMAIL",
            code: "invalid_email",
            message:
              'Environment variable "ADMIN_EMAIL" must be a valid email address',
          },
        ]);
      }
    }
  });

  it("reports invalid_default when a function default throws (missing-value path)", () => {
    try {
      createEnv(
        {
          API_KEY: {
            type: "string",
            default: () => {
              throw new Error("secret store unavailable");
            },
          },
        },
        {
          source: {},
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues).toHaveLength(1);
        expect(error.issues[0]!.key).toBe("API_KEY");
        expect(error.issues[0]!.code).toBe("invalid_default");
        expect(error.issues[0]!.message).toContain("secret store unavailable");
      }
    }
  });

  it("reports invalid_default when a function default throws (empty-string fallback path)", () => {
    try {
      createEnv(
        {
          API_KEY: {
            type: "string",
            default: () => {
              throw new Error("secret store unavailable");
            },
          },
        },
        {
          source: { API_KEY: "" },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues).toHaveLength(1);
        expect(error.issues[0]!.key).toBe("API_KEY");
        expect(error.issues[0]!.code).toBe("invalid_default");
        expect(error.issues[0]!.message).toContain("secret store unavailable");
      }
    }
  });

  it("reports invalid_default when a non-Error is thrown by a default function", () => {
    try {
      createEnv(
        {
          API_KEY: {
            type: "string",
            default: () => {
              throw "string error";
            },
          },
        },
        {
          source: {},
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues[0]!.code).toBe("invalid_default");
        expect(error.issues[0]!.message).toContain("string error");
      }
    }
  });
});
