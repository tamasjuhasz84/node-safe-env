import { describe, expect, it } from "vitest";
import { createEnv } from "../src/createEnv";

describe("email validator", () => {
  it("parses a valid email", () => {
    const env = createEnv(
      {
        EMAIL: { type: "email" },
      },
      {
        source: { EMAIL: "test@example.com" },
      },
    );

    expect(env.EMAIL).toBe("test@example.com");
  });

  it("trims surrounding whitespace", () => {
    const env = createEnv(
      {
        EMAIL: { type: "email" },
      },
      {
        source: { EMAIL: "  test@example.com  " },
      },
    );

    expect(env.EMAIL).toBe("test@example.com");
  });

  it("rejects invalid email", () => {
    expect(() =>
      createEnv(
        {
          EMAIL: { type: "email" },
        },
        {
          source: { EMAIL: "not-an-email" },
        },
      ),
    ).toThrow();
  });

  it("rejects email with whitespace inside", () => {
    expect(() =>
      createEnv(
        {
          EMAIL: { type: "email" },
        },
        {
          source: { EMAIL: "test @example.com" },
        },
      ),
    ).toThrow();
  });

  it("supports default email", () => {
    const env = createEnv({
      EMAIL: { type: "email", default: "default@example.com" },
    });

    expect(env.EMAIL).toBe("default@example.com");
  });
});
