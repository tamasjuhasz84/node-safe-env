import { describe, expect, it } from "vitest";
import { maskEnv } from "../src/maskEnv";

describe("maskEnv", () => {
  it("masks sensitive values", () => {
    const schema = {
      DATABASE_URL: { type: "string", sensitive: true },
      API_KEY: { type: "string", sensitive: true },
      PORT: { type: "port" },
    } as const;

    const env = {
      DATABASE_URL: "postgres://localhost:5432/app",
      API_KEY: "secret123",
      PORT: 3000,
    };

    expect(maskEnv(schema, env)).toEqual({
      DATABASE_URL: "***",
      API_KEY: "***",
      PORT: 3000,
    });
  });

  it("skips undefined optional values", () => {
    const schema = {
      API_KEY: { type: "string", sensitive: true },
      PORT: { type: "port" },
    } as const;

    const env = {
      PORT: 3000,
    };

    expect(maskEnv(schema, env)).toEqual({
      PORT: 3000,
    });
  });

  it("masks non-string sensitive values too", () => {
    const schema = {
      TOKEN_TTL: { type: "number", sensitive: true },
      FLAGS: { type: "array", sensitive: true },
      META: { type: "json", sensitive: true },
    } as const;

    const env = {
      TOKEN_TTL: 3600,
      FLAGS: ["a", "b"],
      META: { region: "eu" },
    };

    expect(maskEnv(schema, env)).toEqual({
      TOKEN_TTL: "***",
      FLAGS: "***",
      META: "***",
    });
  });
});
