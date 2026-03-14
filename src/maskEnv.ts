import type { EnvSchema, ParsedEnv } from "./types/schema";

function maskValue(): string {
  return "***";
}

export function maskEnv<S extends EnvSchema>(
  schema: S,
  env: ParsedEnv<S>,
): Partial<Record<keyof S, unknown>> {
  const masked: Partial<Record<keyof S, unknown>> = {};
  const envRecord = env as unknown as Partial<Record<keyof S, unknown>>;

  for (const key of Object.keys(schema) as Array<keyof S>) {
    const value = envRecord[key];

    if (value === undefined) {
      continue;
    }

    masked[key] = schema[key].sensitive ? maskValue() : value;
  }

  return masked;
}
