import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSchemaModule } from "../src/cli/utils/loadSchemaModule";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unmock("tsx/esm/api");
});

describe("loadSchemaModule", () => {
  it("loads .ts schema modules through tsx", async () => {
    const importSpy = vi.fn(async () => ({
      default: {
        APP_NAME: { type: "string", required: true },
      },
    }));

    const unregisterSpy = vi.fn();
    const registerSpy = vi.fn(() => ({
      import: importSpy,
      unregister: unregisterSpy,
    }));

    vi.doMock("tsx/esm/api", () => ({
      register: registerSpy,
    }));

    const schema = await loadSchemaModule(
      "./test/fixtures/cli/validate.schema.ts",
    );

    expect(registerSpy).toHaveBeenCalledTimes(1);
    expect(importSpy).toHaveBeenCalledTimes(1);
    expect(unregisterSpy).toHaveBeenCalledTimes(1);
    expect(schema).toMatchObject({
      APP_NAME: { type: "string", required: true },
    });
  });

  it("wraps TypeScript loader errors with a CLI-friendly message", async () => {
    const unregisterSpy = vi.fn();
    const registerSpy = vi.fn(() => ({
      import: vi.fn(async () => {
        throw new Error("Cannot transpile module");
      }),
      unregister: unregisterSpy,
    }));

    vi.doMock("tsx/esm/api", () => ({
      register: registerSpy,
    }));

    await expect(
      loadSchemaModule("./test/fixtures/cli/validate.schema.ts"),
    ).rejects.toThrow(
      'Failed to load TypeScript schema module "./test/fixtures/cli/validate.schema.ts" using tsx runtime: Cannot transpile module',
    );

    expect(registerSpy).toHaveBeenCalledTimes(1);
    expect(unregisterSpy).toHaveBeenCalledTimes(1);
  });

  it("keeps JavaScript schema loading behavior unchanged", async () => {
    const jsSchemaPath = fileURLToPath(
      new URL("./fixtures/cli/validate.schema.js", import.meta.url),
    );

    const registerSpy = vi.fn(() => ({
      import: vi.fn(),
      unregister: vi.fn(),
    }));

    vi.doMock("tsx/esm/api", () => ({
      register: registerSpy,
    }));

    const schema = await loadSchemaModule(jsSchemaPath);

    expect(schema).toMatchObject({
      ADMIN_EMAIL: { type: "email", required: true },
    });
    expect(registerSpy).not.toHaveBeenCalled();
  });
});
