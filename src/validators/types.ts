import type { EnvRule, EnvValidationIssue } from "../types/schema";

export type ParseResult = {
  value?: unknown;
  issue?: EnvValidationIssue;
};

export type ValidatorContext = {
  key: string;
  rawValue: string;
  rule: EnvRule;
};

export type EnvValidator = (context: ValidatorContext) => ParseResult;
