export type EnvValidationIssueCode =
  | "missing"
  | "empty"
  | "invalid_enum"
  | "invalid_number"
  | "invalid_boolean"
  | "invalid_url"
  | "invalid_port"
  | "invalid_json";

export type EnvValidationIssue = {
  key: string;
  code: EnvValidationIssueCode;
  message: string;
};

type BaseRule<TDefault = unknown> = {
  required?: boolean;
  default?: TDefault;
  allowEmpty?: boolean;
};

export type StringRule = BaseRule<string> & {
  type: "string";
};

export type NumberRule = BaseRule<number> & {
  type: "number";
};

export type BooleanRule = BaseRule<boolean> & {
  type: "boolean";
};

export type EnumRule<TValues extends readonly string[] = readonly string[]> =
  BaseRule<TValues[number]> & {
    type: "enum";
    values: TValues;
  };

export type UrlRule = BaseRule<string> & {
  type: "url";
};

export type PortRule = BaseRule<number> & {
  type: "port";
};

export type JsonRule = BaseRule<unknown> & {
  type: "json";
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
  | ArrayRule;

export type EnvSchema = Record<string, EnvRule>;

type RuleOutput<R extends EnvRule> = R extends StringRule
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
                    : never;

type IsAlwaysPresent<R extends EnvRule> = R extends { required: true }
  ? true
  : R extends { default: unknown }
    ? true
    : false;

export type ParsedEnv<S extends EnvSchema> = {
  [K in keyof S as IsAlwaysPresent<S[K]> extends true ? K : never]: RuleOutput<
    S[K]
  >;
} & {
  [K in keyof S as IsAlwaysPresent<S[K]> extends true ? never : K]?: RuleOutput<
    S[K]
  >;
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
};

export type IntRule = BaseRule<number> & {
  type: "int";
};

export type FloatRule = BaseRule<number> & {
  type: "float";
};

export type ArrayRule = BaseRule<string[]> & {
  type: "array";
  separator?: string;
};