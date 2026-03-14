import type { EnvSource, LoadedEnvFiles } from "./types/schema";

export function mergeSources(
  files: LoadedEnvFiles,
  runtimeValues: EnvSource = process.env,
): EnvSource {
  return Object.assign(
    Object.create(null),
    files.base,
    files.local,
    files.environment,
    files.custom,
    runtimeValues,
  ) as EnvSource;
}
