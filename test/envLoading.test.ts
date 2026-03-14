import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { createEnv } from "../src/createEnv";

describe("createEnv - env file loading", () => {
  it("loads values from .env files", () => {
    const cwd = fileURLToPath(new URL("./fixtures", import.meta.url));

    const env = createEnv(
      {
        PORT: { type: "number", required: true },
        DEBUG: { type: "boolean", required: true },
      },
      {
        cwd,
        nodeEnv: "production",
      },
    );

    expect(env.PORT).toBe(5000);
    expect(env.DEBUG).toBe(false);
  });
});
