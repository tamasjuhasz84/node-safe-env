import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import type { EnvSchema } from "../../types/schema";

type SchemaModule = {
  default?: unknown;
  schema?: unknown;
};

const SUPPORTED_SCHEMA_EXTENSIONS = [
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".mts",
  ".cts",
] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTypeScriptFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".ts" || ext === ".mts" || ext === ".cts";
}

function isSupportedSchemaFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_SCHEMA_EXTENSIONS.includes(
    ext as (typeof SUPPORTED_SCHEMA_EXTENSIONS)[number],
  );
}

function assertSchemaPathIsUsable(
  absolutePath: string,
  schemaPath: string,
): void {
  if (!isSupportedSchemaFile(absolutePath)) {
    throw new Error(
      `Unsupported schema file type for "${schemaPath}". Supported extensions: ${SUPPORTED_SCHEMA_EXTENSIONS.join(", ")}.`,
    );
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Schema file not found: "${schemaPath}" (resolved to "${absolutePath}").`,
    );
  }
}

async function importTypeScriptModule(
  absolutePath: string,
  schemaPath: string,
): Promise<SchemaModule> {
  try {
    const { register } = await import("tsx/esm/api");
    const api = register({
      namespace: `node-safe-env:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    });

    const loaded = await (async () => {
      try {
        return await api.import(
          pathToFileURL(absolutePath).href,
          import.meta.url,
        );
      } finally {
        api.unregister();
      }
    })();

    if (isObject(loaded)) {
      return loaded as SchemaModule;
    }

    return { default: loaded };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Failed to load TypeScript schema module "${schemaPath}" using tsx runtime: ${message}`,
    );
  }
}

export async function loadSchemaModule(schemaPath: string): Promise<EnvSchema> {
  const absolutePath = path.resolve(schemaPath);
  const moduleUrl = pathToFileURL(absolutePath).href;

  assertSchemaPathIsUsable(absolutePath, schemaPath);

  const mod = isTypeScriptFile(absolutePath)
    ? await importTypeScriptModule(absolutePath, schemaPath)
    : await (async (): Promise<SchemaModule> => {
        try {
          return (await import(moduleUrl)) as SchemaModule;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          throw new Error(
            `Failed to import schema module "${schemaPath}": ${message}`,
          );
        }
      })();

  const schemaCandidate = mod.default ?? mod.schema;

  if (!isObject(schemaCandidate)) {
    throw new Error(
      `Schema module "${schemaPath}" must export a schema as default export or named export "schema".`,
    );
  }

  return schemaCandidate as EnvSchema;
}
