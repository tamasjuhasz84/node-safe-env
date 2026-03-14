import { describe, expect, it } from "vitest";
import { createEnv } from "../src/createEnv";

describe("nested config", () => {
  it("maps nested schema to flattened env keys", () => {
    const env = createEnv(
      {
        server: {
          port: { type: "port", required: true },
        },
        database: {
          url: { type: "string", required: true },
        },
      },
      {
        source: {
          SERVER_PORT: "3000",
          DATABASE_URL: "postgres://localhost/app",
        },
      },
    );

    expect(env).toEqual({
      server: {
        port: 3000,
      },
      database: {
        url: "postgres://localhost/app",
      },
    });
  });

  it("supports defaults in nested schema", () => {
    const env = createEnv(
      {
        server: {
          port: { type: "port", default: 8080 },
        },
      },
      {
        source: {},
      },
    );

    expect(env).toEqual({
      server: {
        port: 8080,
      },
    });
  });

  it("reports missing nested required keys using flattened env key names", () => {
    expect(() =>
      createEnv(
        {
          server: {
            port: { type: "port", required: true },
          },
        },
        {
          source: {},
        },
      ),
    ).toThrowError(/SERVER_PORT/);
  });
});
