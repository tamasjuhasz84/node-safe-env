import { formatIssues } from "../utils/formatIssues";
import { loadSchemaModule } from "../utils/loadSchemaModule";
import { validateExampleEnvFile } from "../../validateExampleEnvFile";

export type ValidateExampleCommandOptions = {
  schemaPath: string;
  cwd?: string;
  exampleFile?: string;
};

export async function runValidateExampleCommand(
  options: ValidateExampleCommandOptions,
): Promise<number> {
  try {
    const schema = await loadSchemaModule(options.schemaPath);

    const issues = validateExampleEnvFile(schema, {
      cwd: options.cwd,
      exampleFile: options.exampleFile,
    });

    if (issues.length > 0) {
      console.error(".env.example validation failed:\n");
      console.error(formatIssues(issues));
      return 1;
    }

    console.log("✓ .env.example validation passed.");
    return 0;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown CLI error";
    console.error(`CLI error: ${message}`);
    return 1;
  }
}
