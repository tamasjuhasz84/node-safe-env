import { describe, expect, it } from "vitest";
import { validateExampleEnv } from "../src/validateExampleEnv";

describe("validateExampleEnv", () => {
  it("returns no issues when example keys match schema keys", () => {
    const schema = {
      server: {
        port: { type: "port", required: true },
      },
      database: {
        url: { type: "string", required: true },
      },
    } as const;

    const exampleSource = {
      SERVER_PORT: "",
      DATABASE_URL: "",
    };

    expect(validateExampleEnv(schema, exampleSource)).toEqual([]);
  });

  it("returns issues for missing example keys", () => {
    const schema = {
      server: {
        port: { type: "port", required: true },
      },
      database: {
        url: { type: "string", required: true },
      },
    } as const;

    const exampleSource = {
      SERVER_PORT: "",
    };

    expect(validateExampleEnv(schema, exampleSource)).toEqual([
      {
        key: "DATABASE_URL",
        code: "missing_example_key",
        message: `Environment variable "DATABASE_URL" is missing from .env.example.`,
      },
    ]);
  });

  it("returns issues for unknown example keys", () => {
    const schema = {
      server: {
        port: { type: "port", required: true },
      },
    } as const;

    const exampleSource = {
      SERVER_PORT: "",
      EXTRA_KEY: "value",
    };

    expect(validateExampleEnv(schema, exampleSource)).toEqual([
      {
        key: "EXTRA_KEY",
        code: "unknown_example_key",
        message: `Environment variable "EXTRA_KEY" in .env.example is not defined in the schema.`,
      },
    ]);
  });

  it("returns both missing and unknown key issues", () => {
    const schema = {
      server: {
        port: { type: "port", required: true },
      },
      database: {
        url: { type: "string", required: true },
      },
    } as const;

    const exampleSource = {
      SERVER_PORT: "",
      EXTRA_KEY: "value",
    };

    expect(validateExampleEnv(schema, exampleSource)).toEqual([
      {
        key: "DATABASE_URL",
        code: "missing_example_key",
        message: `Environment variable "DATABASE_URL" is missing from .env.example.`,
      },
      {
        key: "EXTRA_KEY",
        code: "unknown_example_key",
        message: `Environment variable "EXTRA_KEY" in .env.example is not defined in the schema.`,
      },
    ]);
  });
});
