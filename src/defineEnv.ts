import type { EnvSchema } from "./types/schema";

export function defineEnv<const S extends EnvSchema>(schema: S): S {
  return schema;
}
