import type { EnvValidationIssue } from "../../types/schema";

export function formatIssues(issues: EnvValidationIssue[]): string {
  return issues.map((issue) => `- ${issue.key}: ${issue.message}`).join("\n");
}
