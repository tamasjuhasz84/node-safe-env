import { describe, expect, it } from "vitest";
import { createEnv } from "../src/createEnv";

describe("date validator", () => {
  it("parses an ISO date", () => {
    const env = createEnv(
      {
        START_DATE: { type: "date" },
      },
      {
        source: { START_DATE: "2025-01-01" },
      },
    );

    expect(env.START_DATE).toBeInstanceOf(Date);
    expect(env.START_DATE?.toISOString()).toContain("2025-01-01");
  });

  it("parses an ISO datetime", () => {
    const env = createEnv(
      {
        START_DATE: { type: "date" },
      },
      {
        source: { START_DATE: "2025-01-01T10:30:00Z" },
      },
    );

    expect(env.START_DATE).toBeInstanceOf(Date);
    expect(env.START_DATE?.toISOString()).toBe("2025-01-01T10:30:00.000Z");
  });

  it("rejects invalid calendar dates", () => {
    expect(() =>
      createEnv(
        {
          START_DATE: { type: "date" },
        },
        {
          source: { START_DATE: "2025-02-30" },
        },
      ),
    ).toThrow();
  });

  it("rejects non-ISO date strings", () => {
    expect(() =>
      createEnv(
        {
          START_DATE: { type: "date" },
        },
        {
          source: { START_DATE: "01/31/2025" },
        },
      ),
    ).toThrow();
  });

  it("supports default date string", () => {
    const env = createEnv({
      START_DATE: { type: "date", default: "2025-01-01" },
    });

    expect(env.START_DATE).toBeInstanceOf(Date);
    expect(env.START_DATE?.toISOString()).toContain("2025-01-01");
  });
});
