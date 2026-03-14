/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { ParsedEnv } from "../../src/types/schema";

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;
type AssertTrue<T extends true> = T;
type AssertFalse<T extends false> = T;

const schemaA = {
  features: {
    beta: { type: "boolean" },
  },
} as const;

type EnvA = ParsedEnv<typeof schemaA>;
type _A_FeaturesOptional = AssertTrue<IsOptional<EnvA, "features">>;

const schemaB = {
  server: {
    port: { type: "port", default: 3000 },
  },
} as const;

type EnvB = ParsedEnv<typeof schemaB>;
type _B_ServerRequired = AssertFalse<IsOptional<EnvB, "server">>;

const schemaC = {
  config: {
    a: { type: "string" },
    b: { type: "string", required: true },
  },
} as const;

type EnvC = ParsedEnv<typeof schemaC>;
type _C_ConfigRequired = AssertFalse<IsOptional<EnvC, "config">>;
type _C_AOptional = AssertTrue<IsOptional<EnvC["config"], "a">>;
type _C_BRequired = AssertFalse<IsOptional<EnvC["config"], "b">>;

void 0;
