import { describe, expect, it } from "vitest";
import { createEnv, defineEnv } from "../src";

describe("defineEnv", () => {
  it("is a runtime identity helper", () => {
    const schema = {
      PORT: { type: "number", default: 3000 },
      NODE_ENV: {
        type: "enum",
        values: ["development", "test", "production"] as const,
        default: "development",
      },
    } as const;

    const defined = defineEnv(schema);

    expect(defined).toBe(schema);
  });

  it("works with createEnv", () => {
    const schema = defineEnv({
      PORT: { type: "number", default: 3000 },
      NODE_ENV: {
        type: "enum",
        values: ["development", "test", "production"] as const,
        default: "development",
      },
    });

    const env = createEnv(schema, {
      source: {
        PORT: "8080",
        NODE_ENV: "production",
      },
    });

    expect(env.PORT).toBe(8080);
    expect(env.NODE_ENV).toBe("production");
  });
});
