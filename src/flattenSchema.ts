import type { EnvRule } from "./types/schema";

export type FlattenedSchemaEntry = {
  path: string[];
  envKey: string;
  rule: EnvRule;
};

function isEnvRule(value: unknown): value is EnvRule {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

function toEnvKey(path: string[]): string {
  return path.map((segment) => segment.toUpperCase()).join("_");
}

export function flattenSchema(
  schema: Record<string, unknown>,
  parentPath: string[] = [],
): FlattenedSchemaEntry[] {
  const entries: FlattenedSchemaEntry[] = [];

  for (const [key, value] of Object.entries(schema)) {
    const currentPath = [...parentPath, key];

    if (isEnvRule(value)) {
      entries.push({
        path: currentPath,
        envKey: toEnvKey(currentPath),
        rule: value,
      });

      continue;
    }

    if (typeof value === "object" && value !== null) {
      entries.push(
        ...flattenSchema(value as Record<string, unknown>, currentPath),
      );
    }
  }

  return entries;
}
