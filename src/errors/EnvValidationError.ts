import type { EnvValidationIssue } from "../types/schema";

export class EnvValidationError extends Error {
  public readonly issues: EnvValidationIssue[];

  constructor(issues: EnvValidationIssue[]) {
    super(
      [
        "Environment validation failed:",
        ...issues.map((issue) => `- [${issue.code}] ${issue.message}`),
      ].join("\n"),
    );

    this.name = "EnvValidationError";
    this.issues = issues;
  }
}
