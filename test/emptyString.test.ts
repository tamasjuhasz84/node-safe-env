import { describe, expect, it } from "vitest";
import { createEnv } from "../src/createEnv";
import { EnvValidationError } from "../src/errors/EnvValidationError";

describe("createEnv - empty string handling", () => {
  it("throws when required string is empty and allowEmpty is not enabled", () => {
    expect(() =>
      createEnv(
        {
          JWT_SECRET: {
            type: "string",
            required: true,
          },
        },
        {
          source: {
            JWT_SECRET: "",
          },
        },
      ),
    ).toThrowError(EnvValidationError);

    try {
      createEnv(
        {
          JWT_SECRET: {
            type: "string",
            required: true,
          },
        },
        {
          source: {
            JWT_SECRET: "",
          },
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);

      if (error instanceof EnvValidationError) {
        expect(error.issues[0]?.code).toBe("empty");
      }
    }
  });

  it("allows empty string when allowEmpty is true", () => {
    const env = createEnv(
      {
        OPTIONAL_TEXT: {
          type: "string",
          allowEmpty: true,
        },
      },
      {
        source: {
          OPTIONAL_TEXT: "",
        },
      },
    );

    expect(env.OPTIONAL_TEXT).toBe("");
  });

  it("uses default for empty string when allowEmpty is false and default exists", () => {
    const env = createEnv(
      {
        APP_NAME: {
          type: "string",
          default: "fallback-name",
        },
      },
      {
        source: {
          APP_NAME: "",
        },
      },
    );

    expect(env.APP_NAME).toBe("fallback-name");
  });
});
