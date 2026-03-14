import { describe, expect, it } from "vitest";
import { findUnknownEnvKeys } from "../src/findUnknownEnvKeys";

describe("findUnknownEnvKeys", () => {
  it("returns issues for unknown keys", () => {
    const schema = {
      PORT: { type: "port" },
      API_KEY: { type: "string" },
    } as const;

    const source = {
      PORT: "3000",
      API_KEY: "secret",
      TYPO_APY_KEY: "oops",
    };

    expect(findUnknownEnvKeys(schema, source)).toEqual([
      {
        key: "TYPO_APY_KEY",
        code: "unknown_key",
        message: `Environment variable "TYPO_APY_KEY" is not defined in the schema.`,
      },
    ]);
  });

  it("ignores known keys", () => {
    const schema = {
      PORT: { type: "port" },
    } as const;

    const source = {
      PORT: "3000",
    };

    expect(findUnknownEnvKeys(schema, source)).toEqual([]);
  });

  it("ignores undefined values", () => {
    const schema = {
      PORT: { type: "port" },
    } as const;

    const source = {
      PORT: "3000",
      UNUSED: undefined,
    };

    expect(findUnknownEnvKeys(schema, source)).toEqual([]);
  });
});
