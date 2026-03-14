import { describe, expect, it } from "vitest";
import { createEnv } from "../src/createEnv";
import { EnvValidationError } from "../src/errors/EnvValidationError";

describe("createEnv", () => {
  it("returns parsed env values", () => {
    const env = createEnv(
      {
        PORT: { type: "number", default: 3000 },
        DEBUG: { type: "boolean", default: false },
        NODE_ENV: {
          type: "enum",
          values: ["development", "test", "production"] as const,
          default: "development",
        },
        APP_NAME: { type: "string", default: "node-safe-env" },
      },
      {
        source: {
          PORT: "8080",
          DEBUG: "true",
          NODE_ENV: "production",
          APP_NAME: "demo-app",
        },
      },
    );

    expect(env.PORT).toBe(8080);
    expect(env.DEBUG).toBe(true);
    expect(env.NODE_ENV).toBe("production");
    expect(env.APP_NAME).toBe("demo-app");
  });

  it("uses default values when source values are missing", () => {
    const env = createEnv(
      {
        PORT: { type: "number", default: 3000 },
        DEBUG: { type: "boolean", default: false },
      },
      {
        source: {},
      },
    );

    expect(env.PORT).toBe(3000);
    expect(env.DEBUG).toBe(false);
  });

  it("throws for missing required values", () => {
    expect(() =>
      createEnv(
        {
          JWT_SECRET: { type: "string", required: true },
        },
        {
          source: {},
        },
      ),
    ).toThrowError(EnvValidationError);

    try {
      createEnv(
        {
          JWT_SECRET: { type: "string", required: true },
        },
        {
          source: {},
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues[0]?.code).toBe("missing");
      }
    }
  });

  it("throws for invalid number values", () => {
    expect(() =>
      createEnv(
        {
          PORT: { type: "number", required: true },
        },
        {
          source: {
            PORT: "abc",
          },
        },
      ),
    ).toThrowError(EnvValidationError);

    try {
      createEnv(
        {
          PORT: { type: "number", required: true },
        },
        {
          source: {
            PORT: "abc",
          },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues[0]?.code).toBe("invalid_number");
      }
    }
  });

  it("throws for invalid boolean values", () => {
    expect(() =>
      createEnv(
        {
          DEBUG: { type: "boolean", required: true },
        },
        {
          source: {
            DEBUG: "not-bool",
          },
        },
      ),
    ).toThrowError(EnvValidationError);

    try {
      createEnv(
        {
          DEBUG: { type: "boolean", required: true },
        },
        {
          source: {
            DEBUG: "not-bool",
          },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues[0]?.code).toBe("invalid_boolean");
      }
    }
  });

  it("throws for invalid enum values", () => {
    expect(() =>
      createEnv(
        {
          NODE_ENV: {
            type: "enum",
            values: ["development", "test", "production"] as const,
            required: true,
          },
        },
        {
          source: {
            NODE_ENV: "staging",
          },
        },
      ),
    ).toThrowError(EnvValidationError);

    try {
      createEnv(
        {
          NODE_ENV: {
            type: "enum",
            values: ["development", "test", "production"] as const,
            required: true,
          },
        },
        {
          source: {
            NODE_ENV: "staging",
          },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues[0]?.code).toBe("invalid_enum");
      }
    }
  });

  it("aggregates multiple validation issues", () => {
    expect(() =>
      createEnv(
        {
          PORT: { type: "number", required: true },
          DEBUG: { type: "boolean", required: true },
          JWT_SECRET: { type: "string", required: true },
        },
        {
          source: {
            PORT: "abc",
            DEBUG: "maybe",
            JWT_SECRET: "",
          },
        },
      ),
    ).toThrowError(EnvValidationError);

    try {
      createEnv(
        {
          PORT: { type: "number", required: true },
          DEBUG: { type: "boolean", required: true },
          JWT_SECRET: { type: "string", required: true },
        },
        {
          source: {
            PORT: "abc",
            DEBUG: "maybe",
            JWT_SECRET: "",
          },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues).toHaveLength(3);
        expect(error.issues.map((issue) => issue.code)).toEqual([
          "invalid_number",
          "invalid_boolean",
          "empty",
        ]);
      }
    }
  });
});
