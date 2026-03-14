import { describe, expect, it } from "vitest";
import { formatIssues } from "../src/cli/utils/formatIssues";

describe("formatIssues", () => {
  it("formats issues as bullet lines", () => {
    const output = formatIssues([
      {
        key: "PORT",
        code: "missing",
        message: 'Missing required environment variable "PORT".',
      },
    ]);

    expect(output).toContain(
      '- PORT: Missing required environment variable "PORT".',
    );
  });
});
