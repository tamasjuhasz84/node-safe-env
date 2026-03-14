import { createEnv } from "../../createEnv";
import { EnvValidationError } from "../../errors/EnvValidationError";
import { formatIssues } from "../utils/formatIssues";
import { loadSchemaModule } from "../utils/loadSchemaModule";

export type ValidateCommandOptions = {
  schemaPath: string;
  cwd?: string;
  envFile?: string;
  nodeEnv?: string;
  strict?: boolean;
};

export async function runValidateCommand(
  options: ValidateCommandOptions,
): Promise<number> {
  try {
    const schema = await loadSchemaModule(options.schemaPath);

    createEnv(schema, {
      cwd: options.cwd,
      envFile: options.envFile,
      nodeEnv: options.nodeEnv,
      strict: options.strict,
    });

    console.log("✓ Environment validation passed.");
    return 0;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error("Environment validation failed:\n");
      console.error(formatIssues(error.issues));
      return 1;
    }

    const message =
      error instanceof Error ? error.message : "Unknown CLI error";
    console.error(`CLI error: ${message}`);
    return 1;
  }
}