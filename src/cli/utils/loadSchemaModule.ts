import path from "node:path";
import { pathToFileURL } from "node:url";
import type { EnvSchema } from "../../types/schema";

type SchemaModule = {
  default?: unknown;
  schema?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function loadSchemaModule(schemaPath: string): Promise<EnvSchema> {
  const absolutePath = path.resolve(schemaPath);
  const moduleUrl = pathToFileURL(absolutePath).href;

  const mod = (await import(moduleUrl)) as SchemaModule;

  const schemaCandidate = mod.default ?? mod.schema;

  if (!isObject(schemaCandidate)) {
    throw new Error(
      `Schema module "${schemaPath}" must export a schema as default export or named export "schema".`,
    );
  }

  return schemaCandidate as EnvSchema;
}
