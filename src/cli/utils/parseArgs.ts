export type ParsedCliArgs = {
  command?: string;
  flags: Record<string, string | boolean>;
  positionals: string[];
};

export function parseArgs(argv: string[]): ParsedCliArgs {
  const [command, ...rest] = argv;

  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const flagName = token.slice(2);
    const next = rest[index + 1];

    if (!next || next.startsWith("--")) {
      flags[flagName] = true;
      continue;
    }

    flags[flagName] = next;
    index += 1;
  }

  return {
    command,
    flags,
    positionals,
  };
}
