import { describe, expect, it } from "vitest";
import { createEnv } from "../src/createEnv";
import { EnvValidationError } from "../src/errors/EnvValidationError";

describe("extended env types", () => {
  it("parses url", () => {
    const env = createEnv(
      {
        API_URL: { type: "url", required: true },
      },
      {
        source: {
          API_URL: "https://example.com",
        },
      },
    );

    expect(env.API_URL).toBe("https://example.com");
  });

  it("parses port", () => {
    const env = createEnv(
      {
        PORT: { type: "port", required: true },
      },
      {
        source: {
          PORT: "3000",
        },
      },
    );

    expect(env.PORT).toBe(3000);
  });

  it("parses json", () => {
    const env = createEnv(
      {
        CONFIG: { type: "json", required: true },
      },
      {
        source: {
          CONFIG: '{"a":1}',
        },
      },
    );

    expect(env.CONFIG).toEqual({ a: 1 });
  });

  it("fails on invalid url", () => {
    expect(() =>
      createEnv(
        {
          API_URL: { type: "url", required: true },
        },
        {
          source: {
            API_URL: "not-a-url",
          },
        },
      ),
    ).toThrow(EnvValidationError);
  });

  it("fails on invalid port", () => {
    expect(() =>
      createEnv(
        {
          PORT: { type: "port", required: true },
        },
        {
          source: {
            PORT: "99999",
          },
        },
      ),
    ).toThrow(EnvValidationError);
  });

  it("fails on invalid json", () => {
    expect(() =>
      createEnv(
        {
          CONFIG: { type: "json", required: true },
        },
        {
          source: {
            CONFIG: "{bad json}",
          },
        },
      ),
    ).toThrow(EnvValidationError);
  });
});
