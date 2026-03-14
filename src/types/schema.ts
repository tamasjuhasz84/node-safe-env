export type EnvValidationIssueCode =
  | "missing"
  | "empty"
  | "invalid_enum"
  | "invalid_number"
  | "invalid_boolean"
  | "invalid_url"
  | "invalid_port"
  | "invalid_json"
  | "invalid_array"
  | "invalid_custom"
  | "invalid_email"
  | "invalid_date"
  | "invalid_default"
  | "unknown_key"
  | "missing_example_key"
  | "unknown_example_key";

export type EnvValidationIssue = {
  key: string;
  code: EnvValidationIssueCode;
  message: string;
};

type BaseRule<TDefault = unknown, TOutput = TDefault> = {
  readonly required?: boolean;
  readonly default?: TDefault | (() => TDefault);
  readonly allowEmpty?: boolean;
  readonly transform?: (value: TOutput) => TOutput;
  readonly sensitive?: boolean;
};

export type StringRule = BaseRule<string, string> & {
  readonly type: "string";
};

export type NumberRule = BaseRule<number, number> & {
  readonly type: "number";
};

export type BooleanRule = BaseRule<boolean, boolean> & {
  readonly type: "boolean";
};

export type EnumRule<TValues extends readonly string[] = readonly string[]> =
  BaseRule<TValues[number], TValues[number]> & {
    readonly type: "enum";
    readonly values: TValues;
  };

export type UrlRule = BaseRule<string, string> & {
  readonly type: "url";
};

export type PortRule = BaseRule<number, number> & {
  readonly type: "port";
};

export type JsonRule = BaseRule<unknown, unknown> & {
  readonly type: "json";
};

export type IntRule = BaseRule<number, number> & {
  readonly type: "int";
};

export type FloatRule = BaseRule<number, number> & {
  readonly type: "float";
};

export type ArrayRule = BaseRule<string[], string[]> & {
  readonly type: "array";
  readonly separator?: string;
  readonly trimItems?: boolean;
  readonly allowEmptyItems?: boolean;
};

export type CustomRule<TOutput = unknown> = BaseRule<TOutput, TOutput> & {
  readonly type: "custom";
  readonly parse: (rawValue: string) => TOutput;
};

export type EmailRule = BaseRule<string, string> & {
  readonly type: "email";
};

export type DateRule = BaseRule<string | Date, Date> & {
  readonly type: "date";
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
  | CustomRule
  | EmailRule
  | DateRule;

export type EnvSchemaNode = {
  readonly [key: string]: EnvRule | EnvSchemaNode;
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
                    : R extends EmailRule
                      ? string
                      : R extends DateRule
                        ? Date
                        : R extends CustomRule<infer TOutput>
                          ? TOutput
                          : never;

export type InferRuleOutput<R extends EnvRule> = RuleOutput<R>;

type IsAlwaysPresent<
  R extends { readonly required?: boolean; readonly default?: unknown },
> = R extends { readonly required: true }
  ? true
  : R extends { readonly default: unknown }
    ? true
    : false;

type IsRuleLike<T> = T extends { readonly type: string } ? true : false;

type RuleOutputFrom<T> = T extends { readonly type: "string" }
  ? string
  : T extends { readonly type: "number" }
    ? number
    : T extends { readonly type: "boolean" }
      ? boolean
      : T extends {
            readonly type: "enum";
            readonly values: readonly (infer TValue)[];
          }
        ? TValue & string
        : T extends { readonly type: "url" }
          ? string
          : T extends { readonly type: "port" }
            ? number
            : T extends { readonly type: "json" }
              ? unknown
              : T extends { readonly type: "int" }
                ? number
                : T extends { readonly type: "float" }
                  ? number
                  : T extends { readonly type: "array" }
                    ? string[]
                    : T extends { readonly type: "email" }
                      ? string
                      : T extends { readonly type: "date" }
                        ? Date
                        : T extends {
                              readonly type: "custom";
                              readonly parse: (
                                rawValue: string,
                              ) => infer TOutput;
                            }
                          ? TOutput
                          : never;

type NodeOutput<T> =
  IsRuleLike<T> extends true
    ? RuleOutputFrom<T>
    : T extends Record<string, unknown>
      ? ParsedEnv<T>
      : never;

type HasGuaranteedDescendant<T> =
  IsRuleLike<T> extends true
    ? IsAlwaysPresent<
        T & { readonly required?: boolean; readonly default?: unknown }
      >
    : T extends Record<string, unknown>
      ? true extends {
          [K in keyof T]: HasGuaranteedDescendant<T[K]>;
        }[keyof T]
        ? true
        : false
      : false;

type RequiredParsedKeys<S extends Record<string, unknown>> = {
  [K in keyof S]-?: HasGuaranteedDescendant<S[K]> extends true ? K : never;
}[keyof S];

type OptionalParsedKeys<S extends Record<string, unknown>> = Exclude<
  keyof S,
  RequiredParsedKeys<S>
>;

export type ParsedEnv<S extends Record<string, unknown>> = {
  [K in RequiredParsedKeys<S>]: NodeOutput<S[K]>;
} & {
  [K in OptionalParsedKeys<S>]?: NodeOutput<S[K]>;
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

export type ValidateExampleEnvFileOptions = {
  cwd?: string;
  exampleFile?: string;
};
