import { validateBoolean } from "./boolean";
import { validateEnum } from "./enum";
import { validateJson } from "./json";
import { validateNumber } from "./number";
import { validatePort } from "./port";
import { validateString } from "./string";
import { validateUrl } from "./url";
import type { EnvValidator } from "./types";
import { validateInt } from "./int";
import { validateFloat } from "./float";
import { validateArray } from "./array";
import { validateCustom } from "./custom";

export const validators = {
  string: validateString,
  number: validateNumber,
  boolean: validateBoolean,
  enum: validateEnum,
  url: validateUrl,
  port: validatePort,
  json: validateJson,
  int: validateInt,
  float: validateFloat,
  array: validateArray,
  custom: validateCustom,
} as const satisfies {
  string: EnvValidator;
  number: EnvValidator;
  boolean: EnvValidator;
  enum: EnvValidator;
  url: EnvValidator;
  port: EnvValidator;
  json: EnvValidator;
  int: EnvValidator;
  float: EnvValidator;
  array: EnvValidator;
  custom: EnvValidator;
};

export type { ParseResult, EnvValidator } from "./types";
