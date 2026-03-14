import type { EnvRule, EnvValidationIssue } from "../types/schema";

export type ParseResult = {
  value?: unknown;
  issue?: EnvValidationIssue;
};

export type EnvValidator = (
  key: string,
  rawValue: string,
  rule: EnvRule,
) => ParseResult;
