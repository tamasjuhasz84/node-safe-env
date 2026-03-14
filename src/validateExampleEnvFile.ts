import { readEnvFileSource, resolveExampleEnvPath } from "./readEnvFileSource";
import { validateExampleEnv } from "./validateExampleEnv";
import type {
  EnvSchema,
  EnvValidationIssue,
  ValidateExampleEnvFileOptions,
} from "./types/schema";

export function validateExampleEnvFile(
  schema: EnvSchema,
  options: ValidateExampleEnvFileOptions = {},
): EnvValidationIssue[] {
  const filePath = resolveExampleEnvPath(options.cwd, options.exampleFile);
  const exampleSource = readEnvFileSource(filePath);

  return validateExampleEnv(schema, exampleSource);
}
