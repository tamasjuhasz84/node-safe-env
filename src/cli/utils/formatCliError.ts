export function formatCliError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown CLI error";
  return `CLI error: ${message}`;
}
