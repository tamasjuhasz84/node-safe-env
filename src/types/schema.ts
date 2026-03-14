export type EnvValidationIssueCode =
  | "missing"
  | "empty"
  | "invalid_enum"
  | "invalid_number"
  | "invalid_boolean"
  | "invalid_url"
  | "invalid_port"
  | "invalid_json"
  | "invalid_custom"
  | "unknown_key"
  | "missing_example_key"
  | "unknown_example_key";

export type EnvValidationIssue = {
  key: string;
  code: EnvValidationIssueCode;
  message: string;
};

type BaseRule<TDefault = unknown, TOutput = TDefault> = {
  required?: boolean;
  default?: TDefault;
  allowEmpty?: boolean;
  transform?: (value: TOutput) => TOutput;
  sensitive?: boolean;
};

export type StringRule = BaseRule<string, string> & {
  type: "string";
};

export type NumberRule = BaseRule<number, number> & {
  type: "number";
};

export type BooleanRule = BaseRule<boolean, boolean> & {
  type: "boolean";
};

export type EnumRule<TValues extends readonly string[] = readonly string[]> =
  BaseRule<TValues[number], TValues[number]> & {
    type: "enum";
    values: TValues;
  };

export type UrlRule = BaseRule<string, string> & {
  type: "url";
};

export type PortRule = BaseRule<number, number> & {
  type: "port";
};

export type JsonRule = BaseRule<unknown, unknown> & {
  type: "json";
};

export type IntRule = BaseRule<number, number> & {
  type: "int";
};

export type FloatRule = BaseRule<number, number> & {
  type: "float";
};

export type ArrayRule = BaseRule<string[], string[]> & {
  type: "array";
  separator?: string;
};

export type CustomRule<TOutput = unknown> = BaseRule<TOutput, TOutput> & {
  type: "custom";
  parse: (rawValue: string) => TOutput;
};

export type EnvRule =
  | StringRule
  | NumberRule
  | BooleanRule
  | EnumRule<readonly string[]>
  | UrlRule
  | IntRule
  | FloatRule
  | PortRule
  | JsonRule
  | ArrayRule
  | CustomRule;

export type EnvSchemaNode = {
  [key: string]: EnvRule | EnvSchemaNode;
};

export type EnvSchema = EnvSchemaNode;

export type RuleOutput<R extends EnvRule> = R extends StringRule
  ? string
  : R extends NumberRule
    ? number
    : R extends BooleanRule
      ? boolean
      : R extends EnumRule<infer TValues>
        ? TValues[number]
        : R extends UrlRule
          ? string
          : R extends PortRule
            ? number
            : R extends JsonRule
              ? unknown
              : R extends IntRule
                ? number
                : R extends FloatRule
                  ? number
                  : R extends ArrayRule
                    ? string[]
                    : R extends CustomRule<infer TOutput>
                      ? TOutput
                      : never;

export type InferRuleOutput<R extends EnvRule> = RuleOutput<R>;

type IsAlwaysPresent<R extends EnvRule> = R extends { required: true }
  ? true
  : R extends { default: unknown }
    ? true
    : false;

export type ParsedEnv<S extends EnvSchema> = {
  [K in keyof S as S[K] extends EnvRule
    ? IsAlwaysPresent<S[K]> extends true
      ? K
      : never
    : K]: S[K] extends EnvRule
    ? RuleOutput<S[K]>
    : S[K] extends EnvSchema
      ? ParsedEnv<S[K]>
      : never;
} & {
  [K in keyof S as S[K] extends EnvRule
    ? IsAlwaysPresent<S[K]> extends true
      ? never
      : K
    : never]?: S[K] extends EnvRule ? RuleOutput<S[K]> : never;
};

export type EnvSource = Record<string, string | undefined>;

export type LoadedEnvFiles = {
  base: EnvSource;
  local: EnvSource;
  environment: EnvSource;
  custom: EnvSource;
};

export type LoadEnvFilesOptions = {
  cwd?: string;
  nodeEnv?: string;
  envFile?: string;
};

export type CreateEnvOptions = {
  source?: EnvSource;
  cwd?: string;
  nodeEnv?: string;
  envFile?: string;
  strict?: boolean;
};

export type EnvValueSource =
  | "process.env"
  | ".env"
  | ".env.local"
  | ".env.environment"
  | "custom";

export type EnvTraceEntry = {
  source: EnvValueSource;
  raw: string;
  parsed: unknown;
};
