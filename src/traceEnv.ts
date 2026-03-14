import type { EnvSchema, ParsedEnv, EnvTraceEntry } from "./types/schema";

export function traceEnv<S extends EnvSchema>(
  schema: S,
  sources: Record<string, { source: string; raw: string }>,
  env: ParsedEnv<S>,
): Partial<Record<keyof S, EnvTraceEntry>> {
  const traced: Partial<Record<keyof S, EnvTraceEntry>> = {};
  const envRecord = env as unknown as Partial<Record<keyof S, unknown>>;

  for (const key of Object.keys(schema) as Array<keyof S>) {
    const value = envRecord[key];

    if (value === undefined) {
      continue;
    }

    const sourceInfo = sources[key as string];

    if (!sourceInfo) {
      continue;
    }

    traced[key] = {
      source: sourceInfo.source as EnvTraceEntry["source"],
      raw: sourceInfo.raw,
      parsed: value,
    };
  }

  return traced;
}
