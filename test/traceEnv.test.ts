import { describe, expect, it } from "vitest";
import { traceEnv } from "../src/traceEnv";

describe("traceEnv", () => {
  it("returns source trace for parsed env values", () => {
    const schema = {
      PORT: { type: "port" },
      API_KEY: { type: "string" },
    } as const;

    const env = {
      PORT: 3000,
      API_KEY: "secret",
    };

    const sources = {
      PORT: { source: "process.env", raw: "3000" },
      API_KEY: { source: ".env", raw: "secret" },
    };

    const trace = traceEnv(schema, sources, env);

    expect(trace).toEqual({
      PORT: {
        source: "process.env",
        raw: "3000",
        parsed: 3000,
      },
      API_KEY: {
        source: ".env",
        raw: "secret",
        parsed: "secret",
      },
    });
  });
});
