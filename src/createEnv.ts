import { EnvValidationError } from "./errors/EnvValidationError";
import path from "node:path";
import { findUnknownEnvKeys } from "./findUnknownEnvKeys";
import { flattenSchema } from "./flattenSchema";
import { loadEnvFiles } from "./loadEnvFiles";
import { mergeSources } from "./mergeSources";
import { parseValue } from "./parseValue";
import { setNestedValue } from "./setNestedValue";
import type {
  CreateEnvOptions,
  EnvDebugDefaultKind,
  EnvDebugKeyEntry,
  EnvDebugLoadedFile,
  EnvDebugReport,
  EnvDebugSource,
  EnvRule,
  EnvSchema,
  EnvValidationIssue,
  EnvValueSource,
  LoadedEnvFiles,
  ParsedEnv,
} from "./types/schema";

function isEmptyString(value: string): boolean {
  return value.trim() === "";
}

function defaultToRawValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return JSON.stringify(value);
}

function resolveDefaultValue(value: unknown): unknown {
  return typeof value === "function" ? (value as () => unknown)() : value;
}

function parseDefaultValue(
  envKey: string,
  rule: EnvRule,
): ReturnType<typeof parseValue> & {
  defaultKind: EnvDebugDefaultKind;
  rawDefault?: string;
} {
  const defaultKind: EnvDebugDefaultKind =
    typeof rule.default === "function" ? "function" : "static";
  let resolvedDefault: unknown;

  try {
    resolvedDefault = resolveDefaultValue(rule.default);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      issue: {
        key: envKey,
        code: "invalid_default",
        message: `Default function for "${envKey}" threw an error: ${message}`,
      },
      defaultKind,
    };
  }

  const rawDefault = defaultToRawValue(resolvedDefault);

  return {
    ...parseValue(envKey, rawDefault, rule),
    defaultKind,
    rawDefault,
  };
}

type SourceTrace = Record<string, { source: EnvValueSource; raw: string }>;

function countKeys(source: Record<string, string | undefined>): number {
  return Object.values(source).filter((value) => typeof value === "string")
    .length;
}

function buildLoadedFileReport(
  loadedFiles: LoadedEnvFiles,
  cwd: string,
  nodeEnv: string,
  envFile?: string,
): EnvDebugLoadedFile[] {
  return [
    {
      source: ".env",
      path: path.join(cwd, ".env"),
      keyCount: countKeys(loadedFiles.base),
    },
    {
      source: ".env.local",
      path: path.join(cwd, ".env.local"),
      keyCount: countKeys(loadedFiles.local),
    },
    {
      source: ".env.environment",
      path: path.join(cwd, `.env.${nodeEnv}`),
      keyCount: countKeys(loadedFiles.environment),
    },
    {
      source: "custom",
      path: envFile ? path.resolve(cwd, envFile) : undefined,
      keyCount: countKeys(loadedFiles.custom),
    },
  ];
}

function buildSourceTrace(
  loadedFiles: LoadedEnvFiles,
  runtimeValues: Record<string, string | undefined>,
): SourceTrace {
  const trace: SourceTrace = Object.create(null) as SourceTrace;

  const applySource = (
    source: Record<string, string | undefined>,
    label: EnvValueSource,
  ): void => {
    for (const [key, raw] of Object.entries(source)) {
      if (typeof raw === "string") {
        trace[key] = { source: label, raw };
      }
    }
  };

  applySource(loadedFiles.base, ".env");
  applySource(loadedFiles.local, ".env.local");
  applySource(loadedFiles.environment, ".env.environment");
  applySource(loadedFiles.custom, "custom");
  applySource(runtimeValues, "process.env");

  return trace;
}

function maskDebugValue(value: unknown, sensitive: boolean): unknown {
  if (value === undefined) {
    return undefined;
  }

  return sensitive ? "***" : value;
}

function resolveDebugLogger(
  debug: CreateEnvOptions["debug"],
): ((report: EnvDebugReport) => void) | undefined {
  if (debug === true) {
    return (report: EnvDebugReport): void => {
      console.info(report);
    };
  }

  if (debug && typeof debug === "object" && debug.logger) {
    return debug.logger;
  }

  return undefined;
}

export function createEnv<S extends EnvSchema>(
  schema: S,
  options: CreateEnvOptions = {},
): ParsedEnv<S> {
  const debugEnabled = options.debug !== undefined && options.debug !== false;
  const debugLogger = debugEnabled
    ? resolveDebugLogger(options.debug)
    : undefined;
  const debugKeys: EnvDebugKeyEntry[] = [];

  let source: Record<string, string | undefined>;
  let loadedFileReport: EnvDebugLoadedFile[] = [];
  let sourceTrace: SourceTrace = Object.create(null) as SourceTrace;

  if (options.source) {
    source = options.source;

    if (debugEnabled) {
      for (const [key, raw] of Object.entries(source)) {
        if (typeof raw === "string") {
          sourceTrace[key] = { source: "process.env", raw };
        }
      }
    }
  } else {
    const loadedFiles = loadEnvFiles({
      cwd: options.cwd,
      nodeEnv: options.nodeEnv,
      envFile: options.envFile,
    });
    source = mergeSources(loadedFiles, process.env);

    if (debugEnabled) {
      const cwd = options.cwd ?? process.cwd();
      const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
      loadedFileReport = buildLoadedFileReport(
        loadedFiles,
        cwd,
        nodeEnv,
        options.envFile,
      );
      sourceTrace = buildSourceTrace(loadedFiles, process.env);
    }
  }

  const issues: EnvValidationIssue[] = [];
  const result: Record<string, unknown> = {};
  const flattenedSchema = flattenSchema(schema as Record<string, unknown>);

  if (options.strict) {
    issues.push(
      ...findUnknownEnvKeys(schema as Record<string, unknown>, source),
    );
  }

  for (const entry of flattenedSchema) {
    const { path, envKey, rule } = entry;
    const currentValue = source[envKey];
    const sourceInfo = sourceTrace[envKey];
    const sensitive = rule.sensitive === true;
    const defaultKind: EnvDebugDefaultKind | undefined =
      rule.default === undefined
        ? undefined
        : typeof rule.default === "function"
          ? "function"
          : "static";

    const pushDebugEntry = (
      status: EnvDebugKeyEntry["status"],
      values: {
        source: EnvDebugSource;
        usedDefault: boolean;
        raw?: string;
        parsed?: unknown;
        issue?: EnvValidationIssue;
        defaultKind?: EnvDebugDefaultKind;
      },
    ): void => {
      if (!debugEnabled) {
        return;
      }

      debugKeys.push({
        key: envKey,
        ruleType: rule.type,
        source: values.source,
        usedDefault: values.usedDefault,
        defaultKind: values.defaultKind,
        raw: maskDebugValue(values.raw, sensitive) as string | undefined,
        parsed: maskDebugValue(values.parsed, sensitive),
        status,
        issue: values.issue,
      });
    };

    if (typeof currentValue !== "string") {
      if (rule.default !== undefined) {
        const parsedDefault = parseDefaultValue(envKey, rule);

        if (parsedDefault.issue) {
          issues.push(parsedDefault.issue);
          pushDebugEntry("issue", {
            source: "default",
            usedDefault: true,
            defaultKind: parsedDefault.defaultKind,
            raw: parsedDefault.rawDefault,
            issue: parsedDefault.issue,
          });
          continue;
        }

        pushDebugEntry("defaulted", {
          source: "default",
          usedDefault: true,
          defaultKind: parsedDefault.defaultKind,
          raw: parsedDefault.rawDefault,
          parsed: parsedDefault.value,
        });
        setNestedValue(result, path, parsedDefault.value);
        continue;
      }

      if (rule.required) {
        const issue = {
          key: envKey,
          code: "missing",
          message: `Missing required environment variable "${envKey}".`,
        } as const;

        issues.push(issue);
        pushDebugEntry("missing", {
          source: "missing",
          usedDefault: false,
          defaultKind,
          issue,
        });
      } else {
        pushDebugEntry("missing", {
          source: "missing",
          usedDefault: false,
          defaultKind,
        });
      }

      continue;
    }

    const rawValue = currentValue;

    if (!rule.allowEmpty && isEmptyString(rawValue)) {
      if (rule.default !== undefined) {
        const parsedDefault = parseDefaultValue(envKey, rule);

        if (parsedDefault.issue) {
          issues.push(parsedDefault.issue);
          pushDebugEntry("issue", {
            source: "default",
            usedDefault: true,
            defaultKind: parsedDefault.defaultKind,
            raw: parsedDefault.rawDefault,
            issue: parsedDefault.issue,
          });
          continue;
        }

        pushDebugEntry("defaulted", {
          source: "default",
          usedDefault: true,
          defaultKind: parsedDefault.defaultKind,
          raw: parsedDefault.rawDefault,
          parsed: parsedDefault.value,
        });
        setNestedValue(result, path, parsedDefault.value);
        continue;
      }

      const issue = {
        key: envKey,
        code: "empty",
        message: `Environment variable "${envKey}" cannot be empty.`,
      } as const;

      issues.push(issue);
      pushDebugEntry("empty", {
        source: sourceInfo?.source ?? "process.env",
        usedDefault: false,
        defaultKind,
        raw: rawValue,
        issue,
      });
      continue;
    }

    const parsed = parseValue(envKey, rawValue, rule);

    if (parsed.issue) {
      issues.push(parsed.issue);
      pushDebugEntry("issue", {
        source: sourceInfo?.source ?? "process.env",
        usedDefault: false,
        defaultKind,
        raw: rawValue,
        issue: parsed.issue,
      });
      continue;
    }

    pushDebugEntry("parsed", {
      source: sourceInfo?.source ?? "process.env",
      usedDefault: false,
      defaultKind,
      raw: rawValue,
      parsed: parsed.value,
    });
    setNestedValue(result, path, parsed.value);
  }

  if (debugLogger) {
    debugLogger({
      loadedFiles: loadedFileReport,
      keys: debugKeys,
    });
  }

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }

  return result as unknown as ParsedEnv<S>;
}
